import express from "express";
import { registerDoctor, loginDoctor } from "../controllers/doctor.controller.js";
import { body } from "express-validator";

const router = express.Router();

const registerValidation = [
  body("firstName").notEmpty().withMessage("First name is required"),
  body("lastName").notEmpty().withMessage("Last name is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("password")
    .isLength({ min: 8 }).withMessage("Password must be at least 8 characters")
    .matches(/\d/).withMessage("Password must contain at least one number"),
  body("phone").notEmpty().withMessage("Phone number is required"),
  body("specialisation").notEmpty().withMessage("Specialisation is required")
];

const loginValidation = [
  body("email").isEmail().withMessage("Valid email is required"),
  body("password").notEmpty().withMessage("Password is required")
];

router.post("/register", registerValidation, registerDoctor);
router.post("/login", loginValidation, loginDoctor);

export default router;