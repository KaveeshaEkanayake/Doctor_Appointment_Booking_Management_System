import express from "express";
import { body } from "express-validator";
import { authenticate, authorizeDoctor } from "../middlewares/auth.middleware.js";
import { getProfile, updateProfile } from "../controllers/doctor.profile.controller.js";
import { getAvailability, updateAvailability } from "../controllers/availability.controller.js";
import { getDashboardStats } from "../controllers/doctor.dashboard.controller.js";
import { getDoctorEarnings } from "../controllers/doctor.controller.js";
const router = express.Router();

const updateProfileValidation = [
  body("bio")
    .notEmpty().withMessage("Bio is required")
    .isLength({ max: 1000 }).withMessage("Bio must be under 1000 characters"),
  body("qualifications")
    .notEmpty().withMessage("Qualifications is required"),
  body("experience")
    .notEmpty().withMessage("Experience is required"),
  body("consultationFee")
    .notEmpty().withMessage("Consultation fee is required")
    .isFloat({ min: 0 }).withMessage("Consultation fee must be a non-negative number"),
  body("specialisation")
    .notEmpty().withMessage("Specialisation is required"),
  body("profilePhoto")
    .optional()
    .isURL().withMessage("Profile photo must be a valid URL")
];

const updateAvailabilityValidation = [
  body("availability")
    .optional()
    .isArray().withMessage("Availability must be an array"),
  body("appointmentDuration")
    .optional()
    .isInt().withMessage("Appointment duration must be a number")
];

// Profile routes
router.get("/profile", authenticate, authorizeDoctor, getProfile);
router.put("/profile", authenticate, authorizeDoctor, updateProfileValidation, updateProfile);

// Availability routes
router.get("/availability", authenticate, authorizeDoctor, getAvailability);
router.put("/availability", authenticate, authorizeDoctor, updateAvailabilityValidation, updateAvailability);

router.get("/dashboard", authenticate, authorizeDoctor, getDashboardStats);
router.get("/earnings", authenticate, authorizeDoctor, getDoctorEarnings);

export default router;