const express = require("express")

const router = express.Router()

const {
    addBookmark,
    removeBookmark,
    getMyBookmarks
} = require("../contollers/bookmark.controller")

const { protect } = require("../middlewares/auth.middleware")


router.get("/",protect,getMyBookmarks)
router.post("/:blogId", protect, addBookmark)
router.delete("/:blogId", protect, removeBookmark)

module.exports = router