import express from "express";
import { getApprovedDoctors, getPublicDoctorProfile } from "../controllers/doctor.profile.controller.js";

const router = express.Router();

// Public routes - no auth needed
router.get("/", getApprovedDoctors);
router.get("/:id", getPublicDoctorProfile);

export default router;