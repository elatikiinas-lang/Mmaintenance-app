const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ======================
// REGISTER
// ======================
exports.register = async (req, res) => {
  try {
    const { nom, email, password, role } = req.body;

    // check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Email already used" });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      nom,
      email,
      password: hashedPassword,
      role: role || "USER",
    });

    // remove password from response
    const { password: _, ...userWithoutPassword } = user.dataValues;

    res.status(201).json({
      message: "User created",
      user: userWithoutPassword,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ======================
// LOGIN
// ======================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Wrong password" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // remove password before sending
    const { password: _, ...userWithoutPassword } = user.dataValues;

    res.json({
      token,
      user: userWithoutPassword,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};