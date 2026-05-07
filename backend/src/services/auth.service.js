const prisma = require("../config/prisma");
const crypto = require("crypto");
const { hashPassword, comparePassword } = require("../utils/hash.util");
const { generateToken } = require("../utils/jwt.util");
const { sendLoginNotification, sendRegistrationPendingNotification, sendAccountCreatedNotification } = require("./email.service");


const createUser = async ({ name, email, phone_number, password, role, createdByAdmin }) => {
  if (!name || !email || !phone_number || !password || !role) {
    throw new Error("Missing required user fields");
  }

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { email },
        { phone_number }
      ]
    }
  });

  if (existingUser) {
    throw new Error("User already exists");
  }

  const hashedPassword = await hashPassword(password);

  const user = await prisma.$transaction(async (tx) => {
    const createdUser = await tx.user.create({
      data: {
        name,
        email,
        phone_number,
        password: hashedPassword,
        role,
        isVerified: role === "ADMIN"
      }
    });

    if (role === "PARENT") {
      await tx.parent.create({
        data: { userId: createdUser.id }
      });
    }

    await tx.device.create({
      data: {
        userId: createdUser.id,
        isVerified: role === "ADMIN",
        verifiedAt: role === "ADMIN" ? new Date() : null,
        verifiedById: role === "ADMIN" ? createdUser.id : null
      }
    });

    return createdUser;
  });

  // Send credential + pending notice email for admin-created accounts
  if (createdByAdmin && role !== "ADMIN") {
    await sendAccountCreatedNotification(user, password).catch((err) => {
      console.warn("Account creation email failed:", err.message);
    });
  }

  return user;
};

const registerParent = async (data) => {
  const { name, email, phone_number, password } = data;

  const user = await createUser({
    name,
    email,
    phone_number,
    password,
    role: "PARENT",
    createdByAdmin: null
  });

  await sendRegistrationPendingNotification(user).catch((err) => {
    console.warn("Parent registration email failed:", err.message);
  });

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone_number: user.phone_number,
      role: user.role,
      isVerified: user.isVerified
    }
  };
};

const createSession = async (userId, token, tokenHash) => {
  return prisma.session.create({
    data: {
      userId,
      token,
      tokenHash,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    }
  });
};

const login = async (data) => {
  const { email, phone_number, password } = data;

  const user = await prisma.user.findFirst({
    where: {
      OR: [
        email ? { email } : undefined,
        phone_number ? { phone_number } : undefined
      ].filter(Boolean)
    },
    include: { devices: true }
  });

  if (!user) throw new Error("User not found");

  const valid = comparePassword(password, user.password);
  if (!valid) throw new Error("Invalid password");

  const verifiedDevice = user.devices.find((d) => d.isVerified);
  if (!user.isVerified || !user.devices.length || !verifiedDevice) {
    const pendingErr = new Error("Your account is pending admin approval. You will be notified by email once your device is approved.");
    pendingErr.code = "DEVICE_NOT_VERIFIED";
    pendingErr.role = user.role;
    throw pendingErr;
  }

  const token = generateToken(user);
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  await createSession(user.id, token, tokenHash);

  await sendLoginNotification(user).catch((err) => {
    console.warn("Login email notification failed:", err.message);
  });

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone_number: user.phone_number,
      role: user.role,
      isVerified: user.isVerified
    },
    token
  };
};

module.exports = { createUser, registerParent, login };

