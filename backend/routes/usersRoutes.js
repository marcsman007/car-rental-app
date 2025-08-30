const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { protect, admin } = require("../middlewares/authMiddleware");

// GET all users (admin only)
router.get("/", protect, admin, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch users ❌" });
  }
});

// DELETE a user (admin only)
router.delete("/:id", protect, admin, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted ✅" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete user ❌" });
  }
});

module.exports = router;
