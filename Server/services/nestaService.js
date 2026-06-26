const Nesta = require("../models/nestaModel");
const { paginate, buildSort } = require("./paginationService");

/**
 * Get nestas for a specific user with pagination and sorting
 */
exports.getUserNestas = async (userId, query) => {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 10;

  const filter = { author: userId };
  const sortObj = buildSort(query, ["createdAt", "score", "totalUpVotes"], "-createdAt");

  let nestasQuery = Nesta.find(filter)
    .populate("author", "name email image")
    .sort(sortObj);

  const result = await paginate(nestasQuery, page, limit);

  const sanitizedData = sanitizeNestas(result.data);

  return {
    data: sanitizedData,
    pagination: result.pagination,
  };
};

/**
 * Get current user's nestas with pagination and sorting
 */
exports.getMyNestas = async (userId, query) => {
  return exports.getUserNestas(userId, query);
};

/**
 * Get all nestas with pagination and sort modes: top, new, controversial
 */
exports.getAllNestas = async (query) => {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 10;
  const sort = query.sort || "new";

  let nestasQuery;

  switch (sort) {
    case "top":
      // Sort by score (upVotes - downVotes) descending
      nestasQuery = Nesta.aggregate()
        .addFields({
          totalUpVotes: { $size: { $ifNull: ["$upVotes", []] } },
          totalDownVotes: { $size: { $ifNull: ["$downVotes", []] } },
          score: {
            $subtract: [
              { $size: { $ifNull: ["$upVotes", []] } },
              { $size: { $ifNull: ["$downVotes", []] } },
            ],
          },
        })
        .sort({ score: -1, createdAt: -1 });
      break;

    case "controversial":
      // Sort by total voting activity (upVotes + downVotes) descending
      nestasQuery = Nesta.aggregate()
        .addFields({
          totalUpVotes: { $size: { $ifNull: ["$upVotes", []] } },
          totalDownVotes: { $size: { $ifNull: ["$downVotes", []] } },
          score: {
            $subtract: [
              { $size: { $ifNull: ["$upVotes", []] } },
              { $size: { $ifNull: ["$downVotes", []] } },
            ],
          },
          totalVotes: {
            $add: [
              { $size: { $ifNull: ["$upVotes", []] } },
              { $size: { $ifNull: ["$downVotes", []] } },
            ],
          },
        })
        .sort({ totalVotes: -1, createdAt: -1 });
      break;

    case "new":
    default:
      // Sort by createdAt descending (default Mongoose)
      nestasQuery = Nesta.find()
        .populate("author", "name email image")
        .sort({ createdAt: -1 });
      break;
  }

  // For aggregation pipelines, we need to populate manually and paginate
  if (sort === "top" || sort === "controversial") {
    // Execute aggregation
    const allResults = await nestasQuery;

    // Manual pagination on aggregated results
    const totalItems = allResults.length;
    const totalPages = Math.ceil(totalItems / limit);
    const currentPage = page;
    const skip = (currentPage - 1) * limit;
    const paginatedData = allResults.slice(skip, skip + limit);

    // Populate author for each result
    await Nesta.populate(paginatedData, { path: "author", select: "name email image" });

    const sanitizedData = paginatedData.map(sanitizeNestaAggregated);

    return {
      data: sanitizedData,
      pagination: {
        currentPage,
        itemsPerPage: limit,
        totalPages,
        totalItems,
        hasNextPage: currentPage < totalPages,
        hasPrevPage: currentPage > 1,
      },
    };
  }

  // Standard Mongoose query for "new" sort
  const result = await paginate(nestasQuery, page, limit);
  const sanitizedData = result.data.map(sanitizeNesta);

  return {
    data: sanitizedData,
    pagination: result.pagination,
  };
};

/**
 * Search nestas by content using MongoDB text search
 */
exports.searchNestas = async (searchTerm, query) => {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 10;

  const filter = { $text: { $search: searchTerm } };
  const sortObj = { score: { $meta: "textScore" }, createdAt: -1 };

  let nestasQuery = Nesta.find(filter, { score: { $meta: "textScore" } })
    .populate("author", "name email image")
    .sort(sortObj);

  const result = await paginate(nestasQuery, page, limit);

  const sanitizedData = result.data.map(sanitizeNesta);

  return {
    data: sanitizedData,
    pagination: result.pagination,
  };
};

// ==================== HELPERS ====================

const sanitizeNesta = (nesta) => {
  const obj = nesta.toJSON();
  if (obj.isAnonymous) {
    obj.author = "Anonymous";
  }
  obj.totalUpVotes = obj.upVotes ? obj.upVotes.length : 0;
  obj.totalDownVotes = obj.downVotes ? obj.downVotes.length : 0;
  obj.score = obj.totalUpVotes - obj.totalDownVotes;
  return obj;
};

const sanitizeNestaAggregated = (nesta) => {
  const obj = nesta.toJSON ? nesta.toJSON() : { ...nesta };
  if (obj.isAnonymous) {
    obj.author = "Anonymous";
  }
  // Fields are already computed by aggregation
  obj.totalUpVotes = obj.totalUpVotes || 0;
  obj.totalDownVotes = obj.totalDownVotes || 0;
  obj.score = obj.score || 0;
  return obj;
};

const sanitizeNestas = (nestas) => nestas.map(sanitizeNesta);