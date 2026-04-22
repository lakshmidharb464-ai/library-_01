import User from "../models/User.js";

export const createUser = async (req, res) => {
  try {
    const { name, email, role, createdBy } = req.body;

    const user = new User({
      name,
      email,
      role,
      createdBy,
      status: "pending"
    });

    const saved = await user.save();
    res.json(saved);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
export const approveUser = async (req, res) => {
  try {
    const { userId, adminId } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      {
        status: "approved",
        approvedBy: adminId
      },
      { new: true }
    );

    res.json(user);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
export const getUsers = async (req, res) => {
  try {
    const users = await User.find()
      .populate("createdBy", "name email")
      .populate("approvedBy", "name email");

    res.json(users);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};