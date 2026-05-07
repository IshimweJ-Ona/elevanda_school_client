const crypto = require("crypto");

const hashPassword = (password) => {
    return crypto.createHash("sha512").update(password).digest("hex");
};

const comparePassword = (password, hashed) => {
    return hashPassword(password) === hashed;
};

module.exports = { hashPassword, comparePassword };
