import express from "express";
import { body } from "express-validator";
import { authenticate, authorizeDoctor } from "../middlewares/auth.middleware.js";
import { getProfile, updateProfile } from "../controllers/doctor.profile.controller.js";
import { getAvailability, updateAvailability } from "../controllers/availability.controller.js";

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
    .isFloat({ min: 0 }).withMessage("Consultation fee must be a non-negative number"),
  body("specialisation")
    .optional()
    .notEmpty().withMessage("Specialisation cannot be empty")
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

export default router;