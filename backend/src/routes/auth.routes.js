import { Router } from "express";
import { body } from "express-validator";
import { registerPatient } from "../controllers/patient.controller.js";
import validate from "../middlewares/validate.middleware.js";

const router = Router();

// Validation rules for registration
const registerValidation = [
  body("firstName")
    .notEmpty()
    .withMessage("First name is required"),

  body("lastName")
    .notEmpty()
    .withMessage("Last name is required"),

  body("email")
    .isEmail()
    .withMessage("Please provide a valid email"),

  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .matches(/\d/)
    .withMessage("Password must contain at least one number"),

  body("phone")
    .notEmpty()
    .withMessage("Phone number is required"),
];

// POST /api/auth/register
// 1. Run validation → 2. Check errors → 3. Run controller
router.post("/register", registerValidation, validate, registerPatient);

export default router;