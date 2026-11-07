const Job = require("../models/Job");

const createJob = async ({
    title,
    description,
    skills,
    experienceLevel,
    budget,
    duration,
    workType,
    freelancerId,
}) => {
    if (
        !title ||
        !description ||
        !skills ||
        !experienceLevel ||
        budget === undefined ||
        !duration
    ) {
        throw new Error("All required fields must be provided");
    }

    if (!Array.isArray(skills) || skills.length === 0) {
        throw new Error("At least one skill is required");
    }

    const job = await Job.create({
        title,
        description,
        skills,
        experienceLevel,
        budget,
        duration,
        workType,
        freelancerId,
    });

    return job;
};

const getJobs = async ({
    page = 1,
    limit = 10,
    search,
    skills,
    experienceLevel,
    workType,
    minBudget,
    maxBudget,
    status = "OPEN",
    freelancerId,
}) => {
    const filter = {};

    // Status
    if (status && status !== "ALL") {
        filter.status = status;
    }

    // Freelancer filter
    if (freelancerId) {
        filter.freelancerId = freelancerId;
    }

    // Experience level
    if (experienceLevel) {
        filter.experienceLevel = experienceLevel;
    }

    // Work type
    if (workType) {
        filter.workType = workType;
    }

    // Budget range
    if (minBudget !== undefined || maxBudget !== undefined) {
        filter.budget = {};

        if (minBudget !== undefined) {
            filter.budget.$gte = Number(minBudget);
        }

        if (maxBudget !== undefined) {
            filter.budget.$lte = Number(maxBudget);
        }
    }

    // Skills
    if (skills) {
        const skillList = skills
            .split(",")
            .map((skill) => skill.trim())
            .filter(Boolean);

        if (skillList.length > 0) {
            filter.skills = {
                $in: skillList,
            };
        }
    }

    // Search
    if (search) {
        filter.$or = [
            {
                title: {
                    $regex: search,
                    $options: "i",
                },
            },
            {
                description: {
                    $regex: search,
                    $options: "i",
                },
            },
        ];
    }

    // Pagination
    const pageNumber = Math.max(Number(page), 1);
    const limitNumber = Math.min(Math.max(Number(limit), 1), 50);

    const skip = (pageNumber - 1) * limitNumber;

    const [jobs, totalJobs] = await Promise.all([
        Job.find(filter)
            .populate(
                "freelancerId",
                "firstName lastName profilePicture experienceLevel"
            )
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNumber),

        Job.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalJobs / limitNumber);

    return {
        jobs,
        pagination: {
            currentPage: pageNumber,
            limit: limitNumber,
            totalJobs,
            totalPages,
            hasNextPage: pageNumber < totalPages,
            hasPreviousPage: pageNumber > 1,
        },
    };
};

const getJobById = async (jobId) => {
    const job = await Job.findById(jobId)
        .populate(
            "freelancerId",
            "firstName lastName profilePicture bio skills github portfolio experienceLevel"
        );

    if (!job) {
        throw new Error("Job not found");
    }

    return job;
};

const updateJob = async (jobId, freelancerId, updates) => {
    const allowedFields = [
        "title",
        "description",
        "skills",
        "experienceLevel",
        "budget",
        "duration",
        "workType",
        "status",
    ];

    const filteredUpdates = {};

    for (const field of allowedFields) {
        if (updates[field] !== undefined) {
            filteredUpdates[field] = updates[field];
        }
    }

    if (
        filteredUpdates.status !== undefined &&
        !["OPEN", "CLOSED"].includes(filteredUpdates.status)
    ) {
        throw new Error("Invalid status. Must be OPEN or CLOSED");
    }

    if (
        filteredUpdates.skills !== undefined &&
        (!Array.isArray(filteredUpdates.skills) ||
            filteredUpdates.skills.length === 0)
    ) {
        throw new Error("At least one skill is required");
    }

    const job = await Job.findOneAndUpdate(
        {
            _id: jobId,
            freelancerId,
        },
        filteredUpdates,
        {
            returnDocument: "after",
            runValidators: true,
        }
    );

    if (!job) {
        throw new Error(
            "Job not found or you are not authorized to update this job"
        );
    }

    return job;
};

const deleteJob = async (jobId, freelancerId) => {
    const job = await Job.findOneAndDelete({
        _id: jobId,
        freelancerId,
    });

    if (!job) {
        throw new Error(
            "Job not found or you are not authorized to delete this job"
        );
    }

    return job;
};

module.exports = {
    createJob,
    getJobs,
    getJobById,
    updateJob,
    deleteJob,
};