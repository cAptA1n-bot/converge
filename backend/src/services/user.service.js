const User = require("../models/User");

const getMyProfile = async (userId) => {
    const user = await User.findById(userId);

    if (!user) {
        throw new Error("User not found");
    }

    return user;
};

const updateMyProfile = async (userId, updates) => {
    const allowedFields = [
        "firstName",
        "lastName",
        "bio",
        "profilePicture",
        "skills",
        "github",
        "portfolio",
        "experienceLevel",
    ];

    const filteredUpdates = {};

    for (const field of allowedFields) {
        if (updates[field] !== undefined) {
            filteredUpdates[field] = updates[field];
        }
    }

    if (typeof filteredUpdates.skills === "string") {
        filteredUpdates.skills = filteredUpdates.skills
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
    }

    const user = await User.findByIdAndUpdate(
        userId,
        filteredUpdates,
        {
            returnDocument: "after",
            runValidators: true,
        }
    );

    if (!user) {
        throw new Error("User not found");
    }

    return user;
};

const getUserById = async (userId) => {
    const user = await User.findById(userId).select(
        "firstName lastName role bio profilePicture skills github portfolio experienceLevel createdAt"
    );

    if (!user) {
        throw new Error("User not found");
    }

    return user;
};

module.exports = {
    getMyProfile,
    updateMyProfile,
    getUserById,
};