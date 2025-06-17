import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

export const register = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword });

    // Directly use DiceBear avatar URL with name as seed
    const avatarUrl = `https://api.dicebear.com/9.x/adventurer/svg?seed=${encodeURIComponent(
      name
    )}`;

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      // token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    // If userImage is missing, set it
    if (!user.userImage) {
      const avatarUrl = `https://api.dicebear.com/9.x/adventurer/svg?seed=${encodeURIComponent(
        user.name
      )}`;
      user.userImage = avatarUrl;
      await user.save();
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      userImage: user.userImage,
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateExpoPushToken = async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ message: "Expo token is required" });
  }

  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { expoPushToken: token },
      { new: true }
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      message: "Expo push token updated successfully",
      expoPushToken: user.expoPushToken,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateUsername = async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Name is required" });
  }

  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name },
      { new: true }
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      message: "Username updated successfully",
      name: user.name,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
