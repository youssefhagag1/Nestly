/**
 * Pagination helper service
 */

/**
 * Build MongoDB query from filter parameters
 * @param {Object} filter - Base filter object
 * @param {Object} query - Express query object
 * @param {Array} allowedFilters - Array of allowed filter fields
 * @returns {Object} MongoDB filter object
 */
exports.buildFilter = (filter, query, allowedFilters = []) => {
  const mongoFilter = { ...filter };
  // Apply additional filters
  for (const field of allowedFilters) {
    if (query[field]) {
      mongoFilter[field] = query[field];
    }
  }

  return mongoFilter;
};

/**
 * Build MongoDB sort object
 * @param {Object} query - Express query object
 * @param {Array} allowedSortFields - Array of allowed sort fields
 * @param {String} defaultSort - Default sort field (prefix with - for descending)
 * @returns {Object} MongoDB sort object
 */
exports.buildSort = (
  query,
  allowedSortFields = [],
  defaultSort = "-createdAt"
) => {
  const sortField = query.sort || defaultSort;

  const isDesc = sortField.startsWith("-");
  const fieldName = isDesc
    ? sortField.slice(1)
    : sortField;

  // Validate sort field
  if (
    allowedSortFields.length > 0 &&
    !allowedSortFields.includes(fieldName)
  ) {
    const defaultIsDesc = defaultSort.startsWith("-");
    const defaultField = defaultIsDesc
      ? defaultSort.slice(1)
      : defaultSort;

    return {
      [defaultField]: defaultIsDesc ? -1 : 1,
    };
  }

  return {
    [fieldName]: isDesc ? -1 : 1,
  };
};

/**
 * Calculate pagination metadata
 * @param {Number} page - Current page number
 * @param {Number} limit - Items per page
 * @param {Number} totalItems - Total number of items
 * @returns {Object} Pagination metadata
 */
exports.getPaginationMeta = (page, limit, totalItems) => {
  const currentPage = parseInt(page) || 1;
  const itemsPerPage = parseInt(limit) || 10;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const totalItemsCount = totalItems;

  return {
    currentPage,
    itemsPerPage,
    totalPages,
    totalItems: totalItemsCount,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
  };
};

/**
 * Paginate MongoDB query results
 * @param {Object} query - Mongoose query object
 * @param {Number} page - Page number
 * @param {Number} limit - Items per page
 * @returns {Promise<Object>} Paginated results with metadata
 */
exports.paginate = async (query, page = 1, limit = 10) => {
  const currentPage = parseInt(page) || 1;
  const itemsPerPage = parseInt(limit) || 10;
  const skip = (currentPage - 1) * itemsPerPage;

  const dataPromise = query.skip(skip).limit(itemsPerPage);
  const countPromise = query.countDocuments();

  const data = await dataPromise;
  const totalItems = await countPromise;
  const pagination = exports.getPaginationMeta(currentPage, itemsPerPage, totalItems);

  return {
    data,
    pagination,
  };
};