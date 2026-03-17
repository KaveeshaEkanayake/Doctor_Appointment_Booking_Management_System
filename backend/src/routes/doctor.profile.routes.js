import express from "express";
import { body } from "express-validator";
import { authenticate, authorizeDoctor } from "../middlewares/auth.middleware.js";
import {
  getProfile,
  updateProfile,
  getPublicDoctorProfile,
  getApprovedDoctors
} from "../controllers/doctor.profile.controller.js";

const router = express.Router();

const updateProfileValidation = [
  body("profilePhoto")
    .optional()
    .isURL().withMessage("Profile photo must be a valid URL"),
  body("bio")
    .optional()
    .isLength({ max: 1000 }).withMessage("Bio must be under 1000 characters"),
  body("qualifications")
    .optional()
    .notEmpty().withMessage("Qualifications cannot be empty"),
  body("experience")
    .optional()
    .notEmpty().withMessage("Experience cannot be empty"),
  body("consultationFee")
    .optional()
    .isFloat({ min: 0 }).withMessage("Consultation fee must be a positive number"),
  body("specialisation")
    .optional()
    .notEmpty().withMessage("Specialisation cannot be empty")
];

// Protected routes (logged-in doctor only)
router.get("/profile", authenticate, authorizeDoctor, getProfile);
router.put("/profile", authenticate, authorizeDoctor, updateProfileValidation, updateProfile);

// Public routes (no auth needed)
router.get("/", getApprovedDoctors);
router.get("/:id", getPublicDoctorProfile);

export default router;