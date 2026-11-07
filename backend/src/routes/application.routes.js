const express = require("express");

const applicationController = require("../controllers/application.controller");
const authenticate = require("../middleware/auth.middleware");
const requireRole = require("../middleware/role.middleware");

const router = express.Router();

router.post("/jobs/:jobId/applications",authenticate,requireRole("FRESHER"),applicationController.createApplication);
router.get("/jobs/:jobId/applications",authenticate,requireRole("FREELANCER"),applicationController.getApplicationsForJob);
router.get("/applications/freelancer",authenticate,requireRole("FREELANCER"),applicationController.getFreelancerApplications);
router.patch("/applications/:applicationId",authenticate,applicationController.updateApplicationStatus);
router.get("/applications/me",authenticate,requireRole("FRESHER"),applicationController.getMyApplications);

module.exports = router;