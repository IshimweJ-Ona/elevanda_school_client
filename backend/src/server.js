require("dotenv").config();
const app = require("./app");
const prisma = require("./config/prisma");
const { assertRequiredEnv, env } = require("./config/env");
const { verifyEmailTransporter } = require("./services/email.service");

assertRequiredEnv();

const PORT = env.port;

verifyEmailTransporter()
  .then((verified) => {
    if (verified === false) {
      console.warn("Email transporter verification skipped: email is not configured.");
      return;
    }
    console.log("Email transporter verified successfully.");
  })
  .catch((err) => console.warn("Email transporter verification failed:", err.message));

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});

const gracefulShutdown = async () => {
  await prisma.$disconnect();
  process.exit(0);
};

process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);
