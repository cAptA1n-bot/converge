const Application = require("../models/Application");
const Job = require("../models/Job");

const createApplication = async ({
    jobId,
    applicantId,
    coverLetter,
    proposedBudget,
}) => {
    // 1. Check whether the job exists
    const job = await Job.findById(jobId);

    if (!job) {
        throw new Error("Job not found");
    }

    // 2. Check whether the job is still open
    if (job.status !== "OPEN") {
        throw new Error("This job is no longer accepting applications");
    }

    // 3. Check whether this user has already applied
    const existingApplication = await Application.findOne({
        jobId,
        applicantId,
    });

    if (existingApplication) {
        throw new Error("You have already applied to this job");
    }

    // 4. Validate application data
    if (!coverLetter || proposedBudget === undefined) {
        throw new Error(
            "Cover letter and proposed budget are required"
        );
    }

    // 5. Create application
    const application = await Application.create({
        jobId,
        applicantId,
        coverLetter,
        proposedBudget,
    });

    return application;
};

const getApplicationsForJob = async (jobId, freelancerId) => {
    // 1. Find the job and make sure this freelancer owns it
    const job = await Job.findOne({
        _id: jobId,
        freelancerId,
    });

    if (!job) {
        throw new Error(
            "Job not found or you are not authorized to view its applications"
        );
    }

    // 2. Find all applications for this job
    const applications = await Application.find({ jobId })
        .populate(
            "applicantId",
            "firstName lastName profilePicture bio skills github portfolio experienceLevel"
        )
        .sort({ createdAt: -1 });

    return applications;
};

const updateApplicationStatus = async (
    applicationId,
    userId,
    newStatus
) => {
    const application = await Application.findById(applicationId);

    if (!application) {
        throw new Error("Application not found");
    }

    const job = await Job.findById(application.jobId);

    if (!job) {
        throw new Error("Job not found");
    }

    // Applicant can only withdraw their own application
    if (newStatus === "WITHDRAWN") {
        if (application.applicantId.toString() !== userId) {
            throw new Error(
                "You are not authorized to withdraw this application"
            );
        }

        if (
            application.status === "ACCEPTED" ||
            application.status === "REJECTED"
        ) {
            throw new Error(
                "This application can no longer be withdrawn"
            );
        }
    } else {
        // All other status changes are only allowed
        // for the freelancer who owns the job
        if (job.freelancerId.toString() !== userId) {
            throw new Error(
                "You are not authorized to update this application"
            );
        }

        if (application.status === "WITHDRAWN") {
            throw new Error("Cannot update a withdrawn application");
        }

        if (!["SHORTLISTED", "ACCEPTED", "REJECTED"].includes(newStatus)) {
            throw new Error("Invalid application status");
        }
    }

    application.status = newStatus;

    await application.save();

    return application;
};

const getMyApplications = async (applicantId) => {
    const applications = await Application.find({
        applicantId,
    })
        .populate(
            "jobId",
            "title description skills experienceLevel budget duration workType status freelancerId"
        )
        .sort({ createdAt: -1 });

    return applications;
};

const getFreelancerApplications = async (freelancerId) => {
    const jobs = await Job.find({ freelancerId }).select("_id title status budget duration workType experienceLevel");
    const jobIds = jobs.map((j) => j._id);

    const applications = await Application.find({ jobId: { $in: jobIds } })
        .populate(
            "applicantId",
            "firstName lastName profilePicture bio skills github portfolio experienceLevel email"
        )
        .populate(
            "jobId",
            "title status budget duration workType experienceLevel freelancerId"
        )
        .sort({ createdAt: -1 });

    return applications;
};

module.exports = {
    createApplication,
    getApplicationsForJob,
    updateApplicationStatus,
    getMyApplications,
    getFreelancerApplications,
}; 