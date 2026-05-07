const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const prisma =  require("../config/prisma");

const authMiddleware = async (req, res, next) => {
  try {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
      throw new Error("No token provided");
    }

    const token = header.split(" ")[1];
    if (!token) {
      throw new Error("Invalid token");
    }
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const session = await prisma.session.findUnique({
      where: { tokenHash }
    });

    if (
      !session ||
      !session.isActive ||
      session.expiresAt.getTime() < Date.now() ||
      session.userId !== decoded.id
    ) {
      throw new Error("Session expired");
    }

    req.user = decoded;

    next();
  } catch (err) {
    res.status(401).json({ message: "Unauthorized" });
  }
};

module.exports = authMiddleware;
