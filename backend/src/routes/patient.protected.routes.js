import { Router } from "express";
import { body }   from "express-validator";
import { authenticate, authorizePatient } from "../middlewares/auth.middleware.js";
import { getPatientProfile, updatePatientProfile } from "../controllers/patient.profile.controller.js";
import validate from "../middlewares/validate.middleware.js";
import { getPatientDashboardStats } from "../controllers/patient.dashboard.controller.js";

const router = Router();

router.get("/profile", authenticate, authorizePatient, getPatientProfile);

router.put(
  "/profile",
  authenticate,
  authorizePatient,
  [
    body("firstName").optional().notEmpty().withMessage("First name cannot be empty"),
    body("lastName").optional().notEmpty().withMessage("Last name cannot be empty"),
    body("phone").optional().notEmpty().withMessage("Phone cannot be empty"),
    body("address").optional(),
    body("dateOfBirth").optional().isISO8601().withMessage("Invalid date format"),
  ],
  validate,
  updatePatientProfile
);
router.get("/dashboard", authenticate, authorizePatient, getPatientDashboardStats);

export default router;