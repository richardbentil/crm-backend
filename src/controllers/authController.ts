import User from "../models/User";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { config } from "dotenv";
config();

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const user = await User.create({ name, email, password });
    res.status(201).json({ message: "User registered", user });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res
      .status(200)
      .json({
        message: "Login successful",
        token,
        user: {
          name: user.name,
          email: user.email,
          role: user.role,
          subscriptionPlan: user.subscriptionPlan,
          planDetails: user.planDetails,
        },
      });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

// Update a user's role or details (Admin-only)
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, company } = req.body;

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.name = name || user.name;
    user.email = email || user.email;
    user.role = role || user.role;

    await user.save();
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res
      .status(200)
      .json({
        message: "Updated successful",
        token,
        user: {
          name: user.name,
          email: user.email,
          role: user.role,
          subscriptionPlan: user.subscriptionPlan,
          planDetails: user.planDetails,
        },
      });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update users company
const updateCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, address } = req.body;

    const user: any = await User.findById(id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const company: {name: string, email: string, address: string} = user.company
    company.name = name || company.name;
    company.email = email || company.email;
    company.address = address || company.address;

    await user.save();
    res.status(200).json({ message: "Company data updated successfully", company });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export { register, login, updateUser, updateCompany };
