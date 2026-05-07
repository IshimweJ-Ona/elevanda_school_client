const prisma = require("../config/prisma")

const getUnverifiedDevices = async () => {
    return await prisma.device.findMany({
        where: { isVerified: false},
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone_number: true,
                    role: true
                }
            }
        }
    });
};

const verifyDevice = async (deviceId, adminId) => {
    return await prisma.$transaction(async (tx) => {
        const device = await tx.device.update({
            where: { id: deviceId },
            data: {
                isVerified: true,
                verifiedAt: new Date(),
                verifiedById: adminId
            },
            include: {
                user: true
            }
        });

        if (device.user) {
            await tx.user.update({
                where: { id: device.user.id },
                data: { isVerified: true }
            });
        }

        return device;
    });
};

const denyDevice = async (deviceId) => {
    const device = await prisma.device.findUnique({
        where: { id: deviceId },
        include: { user: true }
    });

    if (!device) {
        throw new Error("Device not found");
    }

    await prisma.device.delete({ where: { id: deviceId } });
    return device;
};

module.exports = {
    getUnverifiedDevices,
    verifyDevice,
    denyDevice
};
