require("dotenv").config()

const express = require("express")
const mongoose = require("mongoose")
const authRouter = require("./routes/auth.router")
const blogRouter = require("./routes/blog.router")

const app = express()

app.use(express.json())

// app.get("/", (req, res) => {
//     res.status(200).json({
//         success: true,
//         message: "Blog platform API is running"
//     })
//     console.log("Server is running")
// })

// auth/register

app.use("/auth",authRouter)
app.use("/blogs",blogRouter)

async function connectDB() {
    try {
        // Connect the client to the server
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Successfully connected to MongoDB using Native Driver!');
        
        // You can now interact with your collections here (e.g., db.collection('users'))

    } catch (error) {
        console.error('Connection error:', error);
    }
}


app.listen(3000, () => {
    console.log("Server is running on PORT 3000")
    connectDB()
})

