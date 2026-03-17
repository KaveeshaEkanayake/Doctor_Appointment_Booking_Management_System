import express from "express";
import { getApprovedDoctors, getPublicDoctorProfile } from "../controllers/doctor.profile.controller.js";
import { getPublicAvailability } from "../controllers/availability.controller.js";

const router = express.Router();

router.get("/", getApprovedDoctors);
router.get("/:id", getPublicDoctorProfile);
router.get("/:id/availability", getPublicAvailability);

export default router;