const jwt = require("jsonwebtoken")
const User = require("../models/user.model")

const protect = async (req, res, next) => {
    try {

        const authHeader = req.headers.authorization

        // Bearer 78jjk
        // ['bearer',"87jjk"]

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Authentication Required. Please provide token"
            })
        }
        // Bearer token
        const token = authHeader.split(" ")[1]

        // id -> token
        // token -> id
        const decoded = jwt.verify(token, process.env.JWT_SECRET)

        const user = await User.findById(decoded.id).select("_id")

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User no longer exists. Please log in again"
            })
        }

        req.user = {
            id: user._id.toString()
        }

        next();

    } catch (err) {
        console.log("Error in protect middlware", err)

        res.status(500).json({
            success: false,
            message: "Error in protect middlware"
        })


    }
}


module.exports = {protect}