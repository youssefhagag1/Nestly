const {FAIL} = require("../Utils/statusText")
module.exports = (...roles) =>{
    return(req , res , next) => {
        if(roles.includes(req.user.role)){
            next()
        }else{
            return res.status(401).json({status : FAIL ,data : "unauthorized action."})
        }
    }
}