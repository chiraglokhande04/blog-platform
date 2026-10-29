const User = require("..models/user.model")

const isAdmin = async (req, res, next) => {
    try {

        if (!req.user?.id) {
            return res.status(401).json({
                message: "Authentication Required."
            })
        }

        const user = await User.findById(req.user.id).select("role")

        if (!user) {
            return res.status(401).json({
                message: "User account not found"
            })
        }

        if (user.role !== "admin") {
            return res.status(403).json({
                message: "Admin access required"
            })
        }

        next()
    } catch (err) {

        console.log("Error in admin middleware: ", err)
        return res.status(500).json({
            message: "Internal Server Error"
        })

    }
}


module.exports = { isAdmin }