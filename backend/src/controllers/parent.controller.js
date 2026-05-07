const prisma =  require("../config/prisma");

const getParentDashboard = async (req, res) => {
    try {
        const userId = req.user.id;

        const parent = await prisma.parent.findUnique({
            where: { userId }
        });

        if (!parent) {
            return res.status(404).json({ message: "Parent not found" });
        }

        res.json({ parent: { id: parent.id, userId: parent.userId }, children: [] });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { getParentDashboard };
