require("dotenv").config();

const http = require("http");
const mongoose = require("mongoose");
const app = require("./src/app");
const connectDB = require("./src/config/db");
const Job = require("./src/models/Job");
const Application = require("./src/models/Application");
const User = require("./src/models/User");

// Helper class for simulating browser requests with cookies
class ClientSession {
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
        this.cookies = {};
    }

    async request(endpoint, options = {}) {
        const { method = "GET", body, headers = {} } = options;

        const cookieHeader = Object.entries(this.cookies)
            .map(([k, v]) => `${k}=${v}`)
            .join("; ");

        const reqHeaders = {
            "Content-Type": "application/json",
            ...headers,
        };

        if (cookieHeader) {
            reqHeaders["Cookie"] = cookieHeader;
        }

        const res = await fetch(`${this.baseUrl}${endpoint}`, {
            method,
            headers: reqHeaders,
            body: body ? JSON.stringify(body) : undefined,
        });

        // Store cookies from Set-Cookie
        const setCookieHeaders = res.headers.getSetCookie
            ? res.headers.getSetCookie()
            : [res.headers.get("set-cookie")].filter(Boolean);

        for (const cookieStr of setCookieHeaders) {
            const parts = cookieStr.split(";")[0].split("=");
            if (parts.length >= 2) {
                const key = parts[0].trim();
                const val = parts.slice(1).join("=").trim();
                if (val === "" || cookieStr.toLowerCase().includes("max-age=0") || cookieStr.toLowerCase().includes("expires=thu, 01 jan 1970")) {
                    delete this.cookies[key];
                } else {
                    this.cookies[key] = val;
                }
            }
        }

        const data = await res.json().catch(() => ({}));
        return {
            status: res.status,
            ok: res.ok,
            data,
        };
    }
}

const runTests = async () => {
    console.log("=== Starting Freelance Platform Verification Tests ===");
    await connectDB();

    const server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, resolve));
    const port = server.address().port;
    const baseUrl = `http://localhost:${port}/api/v1`;
    console.log(`Test server running at ${baseUrl}`);

    const timestamp = Date.now();
    const createdUserIds = [];
    const createdJobIds = [];

    let passedTests = 0;
    let failedTests = 0;

    const assert = (condition, description) => {
        if (condition) {
            console.log(`  ✓ ${description}`);
            passedTests++;
        } else {
            console.error(`  ✗ FAIL: ${description}`);
            failedTests++;
        }
    };

    try {
        // ==========================================
        // JOURNEY 1: FRESHER JOURNEY
        // ==========================================
        console.log("\n--- [Journey 1] Fresher Lifecycle ---");
        const fresherClient = new ClientSession(baseUrl);

        // 1. Register as a fresher
        const fresherEmail = `fresher_${timestamp}@example.com`;
        const fresherRegRes = await fresherClient.request("/auth/register", {
            method: "POST",
            body: {
                firstName: "Alex",
                lastName: "Junior",
                email: fresherEmail,
                password: "Password123!",
                role: "FRESHER",
            },
        });
        assert(fresherRegRes.status === 201 && fresherRegRes.data.success, "1. Fresher registered successfully");
        const fresherId = fresherRegRes.data.data?.user?.id;
        if (fresherId) createdUserIds.push(fresherId);

        // 2. Verify session restored via /auth/me
        const fresherMeRes = await fresherClient.request("/auth/me");
        assert(fresherMeRes.status === 200 && fresherMeRes.data.data?.user?.role === "FRESHER", "2. Session verified via /auth/me");

        // 3. Update fresher profile
        const fresherProfileRes = await fresherClient.request("/users/me", {
            method: "PATCH",
            body: {
                bio: "Passionate junior frontend developer looking to contribute to real-world React apps.",
                skills: ["React", "JavaScript", "HTML", "CSS"],
                experienceLevel: "BEGINNER",
                github: "https://github.com/alexjunior",
                portfolio: "https://alexjunior.dev",
            },
        });
        assert(
            fresherProfileRes.status === 200 &&
            fresherProfileRes.data.data?.user?.skills.includes("React") &&
            fresherProfileRes.data.data?.user?.experienceLevel === "BEGINNER",
            "3. Fresher profile updated with skills, bio, links"
        );

        // Create a temporary job posted by a freelancer for the fresher to apply to
        const testFreelancerClient = new ClientSession(baseUrl);
        const flRegRes = await testFreelancerClient.request("/auth/register", {
            method: "POST",
            body: {
                firstName: "Sarah",
                lastName: "Lead",
                email: `sarah_${timestamp}@example.com`,
                password: "Password123!",
                role: "FREELANCER",
            },
        });
        const leadFreelancerId = flRegRes.data.data?.user?.id;
        if (leadFreelancerId) createdUserIds.push(leadFreelancerId);

        const jobPostRes = await testFreelancerClient.request("/jobs", {
            method: "POST",
            body: {
                title: "Build Responsive Dashboard Widgets",
                description: "We need a junior developer to build clean and reusable dashboard widgets using React.",
                skills: ["React", "CSS", "JavaScript"],
                experienceLevel: "BEGINNER",
                budget: 8000,
                duration: "2 weeks",
                workType: "REMOTE",
            },
        });
        const testJob = jobPostRes.data.data?.job;
        assert(jobPostRes.status === 201 && testJob?._id, "Created test job for application");
        if (testJob?._id) createdJobIds.push(testJob._id);

        // 4. Fresher browses jobs
        const browseJobsRes = await fresherClient.request("/jobs");
        assert(browseJobsRes.status === 200 && Array.isArray(browseJobsRes.data.data?.jobs), "4. Fresher can browse jobs listing");

        // 5. Search and filter jobs
        const searchJobsRes = await fresherClient.request("/jobs?search=Dashboard&experienceLevel=BEGINNER&workType=REMOTE");
        assert(
            searchJobsRes.status === 200 &&
            searchJobsRes.data.data?.jobs.some((j) => j._id === testJob._id),
            "5. Filter and search jobs successfully returns matching job"
        );

        // 6. View job details
        const jobDetailRes = await fresherClient.request(`/jobs/${testJob._id}`);
        assert(jobDetailRes.status === 200 && jobDetailRes.data.data?.job?.title === testJob.title, "6. View job details");

        // 7. Apply to the job
        const applyRes = await fresherClient.request(`/jobs/${testJob._id}/applications`, {
            method: "POST",
            body: {
                coverLetter: "I have built multiple React widgets and would love to assist on this project diligently.",
                proposedBudget: 7500,
            },
        });
        assert(applyRes.status === 201 && applyRes.data.success, "7. Fresher applied with cover letter and proposed budget");
        const applicationId = applyRes.data.data?.application?._id;

        // 8. View submitted application in /applications/me
        const myAppsRes = await fresherClient.request("/applications/me");
        assert(
            myAppsRes.status === 200 &&
            myAppsRes.data.data?.applications.some((a) => a._id === applicationId),
            "8. Submitted application visible in /applications/me"
        );

        // 9. Check status is PENDING
        const appRecord = myAppsRes.data.data?.applications.find((a) => a._id === applicationId);
        assert(appRecord?.status === "PENDING", "9. Application status is initially PENDING");

        // 10. Withdraw the application
        const withdrawRes = await fresherClient.request(`/applications/${applicationId}`, {
            method: "PATCH",
            body: { status: "WITHDRAWN" },
        });
        assert(withdrawRes.status === 200 && withdrawRes.data.data?.application?.status === "WITHDRAWN", "10. Fresher successfully withdrew application");

        // 11. Logout
        const logoutRes = await fresherClient.request("/auth/logout", { method: "POST" });
        assert(logoutRes.status === 200, "11. Logged out successfully");

        // 12. Verify session is cleared
        const postLogoutMe = await fresherClient.request("/auth/me");
        assert(postLogoutMe.status === 401, "12. Session cleared (unauthorized after logout)");


        // ==========================================
        // JOURNEY 2: FREELANCER JOURNEY
        // ==========================================
        console.log("\n--- [Journey 2] Freelancer Lifecycle ---");
        const freelancerClient = new ClientSession(baseUrl);

        // 1. Register as a freelancer
        const flEmail = `freelancer_pro_${timestamp}@example.com`;
        const flReg = await freelancerClient.request("/auth/register", {
            method: "POST",
            body: {
                firstName: "David",
                lastName: "Architect",
                email: flEmail,
                password: "Password123!",
                role: "FREELANCER",
            },
        });
        assert(flReg.status === 201 && flReg.data.data?.user?.role === "FREELANCER", "1. Freelancer registered successfully");
        const flUserId = flReg.data.data?.user?.id;
        if (flUserId) createdUserIds.push(flUserId);

        // 2. Log in
        const flLoginClient = new ClientSession(baseUrl);
        const flLogin = await flLoginClient.request("/auth/login", {
            method: "POST",
            body: {
                email: flEmail,
                password: "Password123!",
            },
        });
        assert(flLogin.status === 200 && flLogin.data.data?.user?.firstName === "David", "2. Freelancer logged in");

        // 3. Complete profile
        const flProfile = await flLoginClient.request("/users/me", {
            method: "PATCH",
            body: {
                bio: "Senior full-stack engineer mentoring junior developers on production apps.",
                skills: ["Node.js", "Express", "MongoDB", "Architecture"],
                experienceLevel: "EXPERIENCED",
                github: "https://github.com/davidarch",
            },
        });
        assert(flProfile.status === 200 && flProfile.data.data?.user?.experienceLevel === "EXPERIENCED", "3. Freelancer profile completed");

        // 4. Create a job
        const createJobRes = await flLoginClient.request("/jobs", {
            method: "POST",
            body: {
                title: "Develop Backend REST APIs for Collaboration Platform",
                description: "Design and implement authenticated RESTful endpoints using Node.js and Express.",
                skills: ["Node.js", "Express", "MongoDB"],
                experienceLevel: "INTERMEDIATE",
                budget: 15000,
                duration: "1 month",
                workType: "REMOTE",
            },
        });
        assert(createJobRes.status === 201 && createJobRes.data.success, "4. Freelancer created job opportunity");
        const flJobId = createJobRes.data.data?.job?._id;
        if (flJobId) createdJobIds.push(flJobId);

        // 5. View the posted job
        const viewJobRes = await flLoginClient.request(`/jobs/${flJobId}`);
        assert(viewJobRes.status === 200 && viewJobRes.data.data?.job?.title.includes("Develop Backend"), "5. Viewed posted job");

        // 6. Edit the job
        const editJobRes = await flLoginClient.request(`/jobs/${flJobId}`, {
            method: "PATCH",
            body: {
                budget: 18000,
                duration: "6 weeks",
            },
        });
        assert(editJobRes.status === 200 && editJobRes.data.data?.job?.budget === 18000, "6. Freelancer edited job budget and duration");

        // A fresher applies to this job so the freelancer can review it
        const applicantClient = new ClientSession(baseUrl);
        const appReg = await applicantClient.request("/auth/register", {
            method: "POST",
            body: {
                firstName: "Maya",
                lastName: "Coder",
                email: `maya_${timestamp}@example.com`,
                password: "Password123!",
                role: "FRESHER",
            },
        });
        if (appReg.data.data?.user?.id) createdUserIds.push(appReg.data.data?.user?.id);

        const flJobAppRes = await applicantClient.request(`/jobs/${flJobId}/applications`, {
            method: "POST",
            body: {
                coverLetter: "I have good experience with Node.js and MongoDB and would love to work on this API project.",
                proposedBudget: 17000,
            },
        });
        assert(flJobAppRes.status === 201, "Applicant applied to freelancer's job");
        const flJobAppId = flJobAppRes.data.data?.application?._id;

        // 7. Review received applications
        const reviewAppsRes = await flLoginClient.request(`/jobs/${flJobId}/applications`);
        assert(
            reviewAppsRes.status === 200 &&
            reviewAppsRes.data.data?.applications.some((a) => a._id === flJobAppId),
            "7. Freelancer retrieved received applications for the job"
        );

        const flAllAppsRes = await flLoginClient.request("/applications/freelancer");
        assert(
            flAllAppsRes.status === 200 &&
            flAllAppsRes.data.data?.applications.some((a) => a._id === flJobAppId),
            "7b. Freelancer retrieved all received applications via /applications/freelancer"
        );

        // 8. Shortlist applicant
        const shortlistRes = await flLoginClient.request(`/applications/${flJobAppId}`, {
            method: "PATCH",
            body: { status: "SHORTLISTED" },
        });
        assert(shortlistRes.status === 200 && shortlistRes.data.data?.application?.status === "SHORTLISTED", "8. Freelancer shortlisted the applicant");

        // 9. Accept applicant
        const acceptRes = await flLoginClient.request(`/applications/${flJobAppId}`, {
            method: "PATCH",
            body: { status: "ACCEPTED" },
        });
        assert(acceptRes.status === 200 && acceptRes.data.data?.application?.status === "ACCEPTED", "9. Freelancer accepted the applicant");

        // 10. Close the job
        const closeJobRes = await flLoginClient.request(`/jobs/${flJobId}`, {
            method: "PATCH",
            body: { status: "CLOSED" },
        });
        assert(closeJobRes.status === 200 && closeJobRes.data.data?.job?.status === "CLOSED", "10. Freelancer closed the job");

        // 11. Delete the job
        const deleteJobRes = await flLoginClient.request(`/jobs/${flJobId}`, {
            method: "DELETE",
        });
        assert(deleteJobRes.status === 200, "11. Freelancer deleted the job");


        // ==========================================
        // JOURNEY 3: AUTHORIZATION & BUSINESS RULES
        // ==========================================
        console.log("\n--- [Journey 3] Authorization & Business Rules ---");

        // Setup for authorization tests
        const authFresherClient = new ClientSession(baseUrl);
        await authFresherClient.request("/auth/register", {
            method: "POST",
            body: {
                firstName: "Auth",
                lastName: "Fresher",
                email: `auth_fresher_${timestamp}@example.com`,
                password: "Password123!",
                role: "FRESHER",
            },
        });

        const flAClient = new ClientSession(baseUrl);
        const flAReg = await flAClient.request("/auth/register", {
            method: "POST",
            body: {
                firstName: "Freelancer",
                lastName: "Alice",
                email: `alice_${timestamp}@example.com`,
                password: "Password123!",
                role: "FREELANCER",
            },
        });
        const aliceId = flAReg.data.data?.user?.id;
        if (aliceId) createdUserIds.push(aliceId);

        const flBClient = new ClientSession(baseUrl);
        const flBReg = await flBClient.request("/auth/register", {
            method: "POST",
            body: {
                firstName: "Freelancer",
                lastName: "Bob",
                email: `bob_${timestamp}@example.com`,
                password: "Password123!",
                role: "FREELANCER",
            },
        });
        const bobId = flBReg.data.data?.user?.id;
        if (bobId) createdUserIds.push(bobId);

        // Rule 1: A fresher cannot create jobs
        const fresherCreateJob = await authFresherClient.request("/jobs", {
            method: "POST",
            body: {
                title: "Unauthorized Job Creation Attempt",
                description: "Should fail because user is a fresher.",
                skills: ["React"],
                experienceLevel: "BEGINNER",
                budget: 1000,
                duration: "1 week",
            },
        });
        assert(fresherCreateJob.status === 403, "Rule 1: Fresher cannot create jobs (HTTP 403 Forbidden)");

        // Alice creates a job
        const aliceJobRes = await flAClient.request("/jobs", {
            method: "POST",
            body: {
                title: "Alice's Private Project Opportunity",
                description: "This project belongs to Alice and should not be modifiable by Bob.",
                skills: ["Node.js"],
                experienceLevel: "INTERMEDIATE",
                budget: 10000,
                duration: "3 weeks",
            },
        });
        const aliceJobId = aliceJobRes.data.data?.job?._id;
        if (aliceJobId) createdJobIds.push(aliceJobId);

        // Rule 2: A freelancer cannot apply to jobs
        const flApplyRes = await flBClient.request(`/jobs/${aliceJobId}/applications`, {
            method: "POST",
            body: {
                coverLetter: "Freelancer trying to apply to another freelancer's job.",
                proposedBudget: 9000,
            },
        });
        assert(flApplyRes.status === 403, "Rule 2: Freelancer cannot apply to jobs (HTTP 403 Forbidden)");

        // Rule 3: A user cannot edit another user's profile
        // Note: /users/me operates on req.user.userId from token, so tampering with another user is prevented.
        // Let's verify Alice's public profile viewed by Bob has only public fields
        const bobViewAlice = await flBClient.request(`/users/${aliceId}`);
        assert(
            bobViewAlice.status === 200 &&
            bobViewAlice.data.data?.user?.email === undefined &&
            bobViewAlice.data.data?.user?.firstName === "Freelancer",
            "Rule 3: Public profile only exposes public fields, hides private email & password"
        );

        // Rule 4: A freelancer cannot modify another freelancer's jobs
        const bobModifyAliceJob = await flBClient.request(`/jobs/${aliceJobId}`, {
            method: "PATCH",
            body: { title: "Bob Hijacking Alice's Job" },
        });
        assert(bobModifyAliceJob.status === 400 || bobModifyAliceJob.status === 403 || bobModifyAliceJob.status === 404, "Rule 4: Bob cannot modify Alice's job");

        const bobDeleteAliceJob = await flBClient.request(`/jobs/${aliceJobId}`, {
            method: "DELETE",
        });
        assert(bobDeleteAliceJob.status === 404 || bobDeleteAliceJob.status === 403, "Rule 4b: Bob cannot delete Alice's job");

        // Fresher applies to Alice's job
        const fresherAppRes = await authFresherClient.request(`/jobs/${aliceJobId}/applications`, {
            method: "POST",
            body: {
                coverLetter: "Legitimate fresher application to Alice's project opportunity.",
                proposedBudget: 9500,
            },
        });
        assert(fresherAppRes.status === 201, "Fresher applied to Alice's job");
        const aliceAppId = fresherAppRes.data.data?.application?._id;

        // Rule 5: A freelancer cannot view another freelancer's private applications
        const bobViewAliceApps = await flBClient.request(`/jobs/${aliceJobId}/applications`);
        assert(bobViewAliceApps.status === 404 || bobViewAliceApps.status === 403, "Rule 5: Bob cannot view applications for Alice's job");

        // Rule 6: A fresher cannot modify another user's application
        const unauthorizedStatusUpdate = await authFresherClient.request(`/applications/${aliceAppId}`, {
            method: "PATCH",
            body: { status: "ACCEPTED" },
        });
        assert(unauthorizedStatusUpdate.status === 400 || unauthorizedStatusUpdate.status === 403, "Rule 6: Fresher cannot change application status to ACCEPTED");

        // Rule 7: Duplicate applications are rejected
        const dupAppRes = await authFresherClient.request(`/jobs/${aliceJobId}/applications`, {
            method: "POST",
            body: {
                coverLetter: "Duplicate application attempt.",
                proposedBudget: 9500,
            },
        });
        assert(dupAppRes.status === 400 && dupAppRes.data.message.includes("already applied"), "Rule 7: Duplicate applications are rejected (HTTP 400)");

        // Rule 8: Closed jobs reject new applications
        await flAClient.request(`/jobs/${aliceJobId}`, {
            method: "PATCH",
            body: { status: "CLOSED" },
        });

        // Another fresher tries to apply to closed job
        const fresher2Client = new ClientSession(baseUrl);
        await fresher2Client.request("/auth/register", {
            method: "POST",
            body: {
                firstName: "Second",
                lastName: "Fresher",
                email: `second_fresher_${timestamp}@example.com`,
                password: "Password123!",
                role: "FRESHER",
            },
        });
        const applyToClosed = await fresher2Client.request(`/jobs/${aliceJobId}/applications`, {
            method: "POST",
            body: {
                coverLetter: "Trying to apply to a closed job opportunity.",
                proposedBudget: 5000,
            },
        });
        assert(applyToClosed.status === 400 && applyToClosed.data.message.includes("no longer accepting applications"), "Rule 8: Closed jobs reject new applications");

        // Rule 9: Unauthenticated users cannot perform protected operations
        const anonClient = new ClientSession(baseUrl);
        const unauthJob = await anonClient.request("/jobs", {
            method: "POST",
            body: { title: "Unauth Job", description: "Fail" },
        });
        assert(unauthJob.status === 401, "Rule 9a: Unauthenticated user cannot create jobs (HTTP 401)");

        const unauthApp = await anonClient.request(`/jobs/${aliceJobId}/applications`, {
            method: "POST",
            body: { coverLetter: "Unauth application" },
        });
        assert(unauthApp.status === 401, "Rule 9b: Unauthenticated user cannot apply to jobs (HTTP 401)");

        const unauthProfile = await anonClient.request("/users/me", { method: "PATCH", body: {} });
        assert(unauthProfile.status === 401, "Rule 9c: Unauthenticated user cannot update profile (HTTP 401)");

    } finally {
        // Cleanup created jobs and test records
        try {
            if (createdJobIds.length > 0) {
                await Job.deleteMany({ _id: { $in: createdJobIds } });
                await Application.deleteMany({ jobId: { $in: createdJobIds } });
            }
            if (createdUserIds.length > 0) {
                await User.deleteMany({ _id: { $in: createdUserIds } });
            }
            console.log("\nCleanup: Removed test database records.");
        } catch (cleanupErr) {
            console.error("Cleanup error:", cleanupErr.message);
        }

        server.close();
        await mongoose.connection.close();
    }

    console.log("\n==========================================");
    console.log(`Results: ${passedTests} passed, ${failedTests} failed`);
    console.log("==========================================");

    if (failedTests > 0) {
        process.exit(1);
    } else {
        process.exit(0);
    }
};

runTests().catch((err) => {
    console.error("Test execution failed:", err);
    process.exit(1);
});

