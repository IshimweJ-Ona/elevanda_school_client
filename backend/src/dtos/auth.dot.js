const registerDTO = (data) => {
    const { name, email, phone_number, password } = data;

    if (!name || !email || !phone_number || !password) {
        throw new Error("Missing required fields")
    }

    const normalizedPhone = normalizeRwandaPhone(phone_number);

    if (!normalizedPhone) {
        throw new Error("Invalid Rwanda phone number format");
    }

    return {
        name: String(name).trim(),
        email: String(email).trim().toLowerCase(),
        phone_number: normalizedPhone,
        password,
        role: "PARENT"
    };
};

const loginDTO = (data) => {
    const { email, phone_number, password } = data;

    if (!email && !phone_number || !password) {
        throw new Error("Provide email or phone number and password");
    }

    const normalizedPhone = phone_number ? normalizeRwandaPhone(phone_number) : undefined;

    if (phone_number && !normalizedPhone) {
        throw new Error("Invalid Rwanda phone number format");
    }

    return {
        email: email ? String(email).trim().toLowerCase() : undefined,
        phone_number: normalizedPhone,
        password
    };
};

const normalizeRwandaPhone = (value) => {
    const compact = String(value ?? "").replace(/[\s()-]/g, "");

    if (/^\+2507\d{8}$/.test(compact)) {
        return compact;
    }

    if (/^2507\d{8}$/.test(compact)) {
        return `+${compact}`;
    }

    if (/^07\d{8}$/.test(compact)) {
        return `+25${compact}`;
    }

    return null;
};

module.exports = { registerDTO, loginDTO }
