import { Router } from "express";
import { body } from "express-validator";
import { registerPatient, loginPatient } from "../controllers/patient.controller.js";
import validate from "../middlewares/validate.middleware.js";
import { forgotPassword, resetPassword } from "../controllers/patient.password.controller.js";


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

// Validation rules for login
const loginValidation = [
  body("email")
    .isEmail()
    .withMessage("Please provide a valid email"),

  body("password")
    .notEmpty()
    .withMessage("Password is required"),
];

// POST /api/auth/register
router.post("/register", registerValidation, validate, registerPatient);

// POST /api/auth/login
router.post("/login", loginValidation, validate, loginPatient);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;