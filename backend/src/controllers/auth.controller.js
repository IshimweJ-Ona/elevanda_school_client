const authService = require("../services/auth.service");
const { loginDTO, registerDTO } = require("../dtos/auth.dot");

const login = async (req, res) => {
  try {
    const data = loginDTO(req.body);
    const result = await authService.login(data);
    res.json(result);
  } catch (err) {
    if (err.code === "PENDING_APPROVAL" || err.code === "DEVICE_NOT_VERIFIED") {
      console.warn("Auth approval blocked:", err.message);
      return res.status(403).json({ message: err.message, code: "DEVICE_NOT_VERIFIED", role: err.role });
    }
    console.warn("Login failed:", err.message);
    res.status(400).json({ message: err.message });
  }
};

const register = async (req, res) => {
  try {
    const data = registerDTO(req.body);
    const result = await authService.registerParent(data);
    res.status(201).json(result);
  } catch (err) {
    console.warn("Registration failed:", err.message);
    res.status(400).json({ message: err.message });
  }
};

module.exports = { login, register };
