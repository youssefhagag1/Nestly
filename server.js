const express = require("express");
const {join} = require("node:path");
const mongoose = require("mongoose");
const cors = require("cors")
const {SUCCESS , FAIL , ERROR} = require("./Utils/statusText")
const app = express();

app.use(cors());
app.use(express.json());

require("dotenv").config();

const url = process.env.MONGO_URL;

mongoose.connect(url).then(() => {
    console.log("mongoose connected successfuly.")
})

const verifyToken = require("./middelwares/verifyToken");
const usersRoute = require("./routers/users.router");
const channelRoute = require("./routers/channel.router");
const tasksRoute = require("./routers/tasks.router");
const tipsRoute = require("./routers/tips.router")
const postsRoute = require("./routers/posts.router");
const commentsRoute = require("./routers/comments.router");


app.use("/uploads" , verifyToken, express.static( join(__dirname , "uploads")))
app.use("/api/users" , usersRoute);
app.use("/api/channels" , channelRoute);
app.use("/api/tasks" , tasksRoute);
app.use("/api/tips" , tipsRoute);
app.use("/api/posts" , postsRoute);
app.use("/api/comments" , commentsRoute);


app.use((req , res , next) => {
    return res.status(404).json({
        code : 404,
        status : FAIL,
        message : "Resourse not avilable.",
        data : null
    })
})

app.use((error , req , res , next) => {

    if (error.name === "ValidationError") {
        return res.status(400).json({
        status: FAIL,
        code: 400,
        message: Object.values(error.errors).map(err => err.message).join(", "),
        data: null
        });
    }else {
    return res.status(500).json({
            status : ERROR,
            code : 500,
            message : error.message,
            data : null
        })
    }
})


app.listen(process.env.PORT , "localhost" , () => {
    console.log("connected on port 3000.")
});