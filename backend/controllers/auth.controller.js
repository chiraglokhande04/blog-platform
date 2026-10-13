const User = require("../models/user.model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

// Generate Token
const generateToken = (userId) => {
    return jwt.sign(
        { id: userId },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    )
}

// "/auth/register"

const register = async (req, res) => {
    try {
        const { name, email, username, password } = req.body

        if (!name || !email || !username || !password) {
            return res.status(400).json({
                success: false,
                message: "Name, email, Username and password are required"
            })
        }

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters long"
            })
        }

        const normalizedEmail = email.trim().toLowerCase();
        const normalizedUsername = username.trim().toLowerCase()

        const existingUser = await User.findOne({
            $or: [
                { email: normalizedEmail },
                { username: normalizedUsername }
            ]
        })

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: existingUser.email === normalizedEmail ? "Email already registered" : "Username already taken"
            })
        }

        const hashedPassword = await bcrypt.hash(password, 12)

        const user = await User.create({
            name: name.trim(),
            username: normalizedUsername,
            email: normalizedEmail,
            password: hashedPassword
        })

        console.log("User created: ", user)

        const token = generateToken(user._id)

        return res.status(201).json({
            success: true,
            message: "User Registered Successfully",
            token,
            user: {
                id: user._id,
                name: user.name,
                username: user.username,
                email: user.email,
                profile_img: user.profile_img,
                bio: user.bio
            }
        })

    } catch (err) {
        console.log("Error in Register Controller: ", err)
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        })
    }
}


// Login User
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            })
        }

        const normalizedEmail = email.trim().toLowerCase();

        const user = await User.findOne({
            email: normalizedEmail
        })

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User with this email is not found"
            })
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password)

        if (!isPasswordMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid Password"
            })
        }

        const token = generateToken(user._id)

        return res.status(200).json({
            success: true,
            message: "Login Successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                username: user.username,
                email: user.email,
                profile_img: user.profile_img,
                bio: user.bio
            }
        })

    } catch (err) {

        console.log("Error in Login Controller: ", err)
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        })

    }
}


const getMe = async (req, res) => {
    try {

        const {id} = req.params

        const user = await User.findById(id).select(
            "-password"
        )

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }

        return res.status(200).json({
            success: true,
            user,
        })

    } catch (err) {

        console.log("Error in getme Controller: ", err)
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        })

    }
}


module.exports = {
    register,
    login,
    getMe
}
