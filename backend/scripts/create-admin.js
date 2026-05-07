require("dotenv").config();
const prisma = require("../src/config/prisma");
const { hashPassword } = require("../src/utils/hash.util");

const main = async () => {
  const email = process.env.ADMIN_EMAIL || "admin@school.local";
  const phone_number = process.env.ADMIN_PHONE || "+250780000000";
  const password = process.env.ADMIN_PASSWORD || "Admin123!";
  const name = process.env.ADMIN_NAME || "Administrator";

  const existing = await prisma.user.findFirst({
    where: {
      OR: [
        { email },
        { phone_number }
      ]
    }
  });

  if (existing) {
    console.log("Admin user already exists:", existing.id);
    process.exit(0);
  }

  const user = await prisma.user.create({
    data: {
      name,
      email,
      phone_number,
      password: await hashPassword(password),
      role: "ADMIN",
      isVerified: true
    }
  });

  await prisma.device.create({
    data: {
      userId: user.id,
      isVerified: true,
      verifiedAt: new Date(),
      verifiedById: user.id
    }
  });

  console.log("Admin account created:", { id: user.id, email, phone_number });
};

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
