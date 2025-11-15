const jwt = require("jsonwebtoken");
const {FAIL} = require("../Utils/statusText")
const verifyToken = (req , res , next) => {
    const auth = req.headers["Authorization"] ||  req.headers["authorization"];
    if(!auth){
        return res.status(401).json({
            code : 401,
            message : "unauthorized action",
            data : null,
            status : FAIL
        })
}
    const token = auth.split(" ")[1];
    try{
        const user = jwt.verify(token , process.env.JWT_SECRET_KEY);
        req.user = user;
        next()
    }catch(e){
        return res.status(401).json({
            code : 401,
            message : "unauthorized action",
            data : null,
            status : FAIL
        })
    }
}

module.exports = verifyToken;