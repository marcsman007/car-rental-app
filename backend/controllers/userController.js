const User = require("../models/User");

// @desc    Get all users (admin only)
// @route   GET /api/users
// @access  Admin
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users); // frontend expects an array
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch users ❌" });
  }
};

// @desc    Delete a user (admin only)
// @route   DELETE /api/users/:id
// @access  Admin
const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted ✅" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete user ❌" });
  }
};

module.exports = {
  getAllUsers,
  deleteUser,
};
