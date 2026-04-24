import express      from "express";
import { registerDoctor, loginDoctor } from "../controllers/doctor.controller.js";
import { body }     from "express-validator";

const router = express.Router();

const registerValidation = [
  body("firstName").notEmpty().withMessage("First name is required"),
  body("lastName").notEmpty().withMessage("Last name is required"),
  body("email").isEmail().withMessage("Valid email is required"),
  body("password")
    .isLength({ min: 8 }).withMessage("Password must be at least 8 characters")
    .matches(/\d/).withMessage("Password must contain at least one number"),
  body("phone").notEmpty().withMessage("Phone number is required"),
  body("specialisation").notEmpty().withMessage("Specialisation is required"),
];

const loginValidation = [
  body("email").isEmail().withMessage("Valid email is required"),
  body("password").notEmpty().withMessage("Password is required"),
];

/**
 * @swagger
 * tags:
 *   name: Doctor Auth
 *   description: Doctor authentication endpoints
 */

/**
 * @swagger
 * /api/auth/doctor/register:
 *   post:
 *     summary: Register a new doctor
 *     tags: [Doctor Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [firstName, lastName, email, password, phone, specialisation]
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: Jane
 *               lastName:
 *                 type: string
 *                 example: Smith
 *               email:
 *                 type: string
 *                 example: jane@example.com
 *               password:
 *                 type: string
 *                 example: Password@123
 *               phone:
 *                 type: string
 *                 example: "0771234567"
 *               specialisation:
 *                 type: string
 *                 example: Cardiology
 *     responses:
 *       201:
 *         description: Doctor registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Registration successful. Await admin approval.
 *       400:
 *         description: Validation error
 *       409:
 *         description: Email already registered
 */
router.post("/register", registerValidation, registerDoctor);

/**
 * @swagger
 * /api/auth/doctor/login:
 *   post:
 *     summary: Login as a doctor
 *     tags: [Doctor Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: jane@example.com
 *               password:
 *                 type: string
 *                 example: Password@123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 token:
 *                   type: string
 *                 doctor:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     firstName:
 *                       type: string
 *                     lastName:
 *                       type: string
 *                     email:
 *                       type: string
 *                     specialisation:
 *                       type: string
 *                     status:
 *                       type: string
 *                       example: APPROVED
 *       401:
 *         description: Invalid credentials
 *       403:
 *         description: Account not approved yet
 */
router.post("/login", loginValidation, loginDoctor);

export default router;