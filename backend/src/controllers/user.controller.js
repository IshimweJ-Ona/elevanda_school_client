const prisma = require("../config/prisma");
const { hashPassword } = require("../utils/hash.util");

const normalizeRwandaPhone = (value) => {
  const compact = String(value ?? "").replace(/[\s()-]/g, "");

  if (/^\+2507\d{8}$/.test(compact)) return compact;
  if (/^2507\d{8}$/.test(compact)) return `+${compact}`;
  if (/^07\d{8}$/.test(compact)) return `+25${compact}`;
  return null;
};

const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone_number: true,
        role: true,
        isVerified: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, email, phone_number, password } = req.body;
    const updates = {};

    if (name) updates.name = name;
    if (email) updates.email = email;
    if (phone_number) {
      const normalizedPhone = normalizeRwandaPhone(phone_number);
      if (!normalizedPhone) {
        return res.status(400).json({ message: "Invalid Rwanda phone number format" });
      }
      updates.phone_number = normalizedPhone;
    }
    if (password) updates.password = await hashPassword(password);

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No update values provided" });
    }

    if (email || phone_number) {
      const existing = await prisma.user.findFirst({
        where: {
          OR: [
            email ? { email } : undefined,
            phone_number ? { phone_number } : undefined
          ].filter(Boolean),
          id: { not: req.user.id }
        }
      });

      if (existing) {
        return res.status(400).json({ message: "Email or phone number already in use" });
      }
    }

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: updates,
      select: {
        id: true,
        name: true,
        email: true,
        phone_number: true,
        role: true,
        isVerified: true
      }
    });

    res.json({ message: "Profile updated successfully", user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getProfile, updateProfile };
