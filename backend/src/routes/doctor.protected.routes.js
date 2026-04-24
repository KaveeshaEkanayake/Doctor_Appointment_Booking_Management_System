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
    .isURL().withMessage("Profile photo must be a valid URL"),
];

const updateAvailabilityValidation = [
  body("availability")
    .optional()
    .isArray().withMessage("Availability must be an array"),
  body("appointmentDuration")
    .optional()
    .isInt().withMessage("Appointment duration must be a number"),
];

/**
 * @swagger
 * tags:
 *   name: Doctor
 *   description: Doctor protected endpoints
 */

/**
 * @swagger
 * /api/doctor/profile:
 *   get:
 *     summary: Get logged in doctor profile
 *     tags: [Doctor]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Doctor profile returned
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
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
 *                     bio:
 *                       type: string
 *                     experience:
 *                       type: string
 *                     consultationFee:
 *                       type: number
 *                     profilePhoto:
 *                       type: string
 *       401:
 *         description: Unauthorized
 */
router.get("/profile", authenticate, authorizeDoctor, getProfile);

/**
 * @swagger
 * /api/doctor/profile:
 *   put:
 *     summary: Update doctor profile
 *     tags: [Doctor]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [bio, qualifications, experience, consultationFee, specialisation]
 *             properties:
 *               bio:
 *                 type: string
 *                 example: Experienced cardiologist
 *               qualifications:
 *                 type: string
 *                 example: MBBS, MD
 *               experience:
 *                 type: string
 *                 example: 10 years
 *               consultationFee:
 *                 type: number
 *                 example: 2500
 *               specialisation:
 *                 type: string
 *                 example: Cardiology
 *               profilePhoto:
 *                 type: string
 *                 example: https://example.com/photo.jpg
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.put("/profile", authenticate, authorizeDoctor, updateProfileValidation, updateProfile);

/**
 * @swagger
 * /api/doctor/availability:
 *   get:
 *     summary: Get doctor availability
 *     tags: [Doctor]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Availability returned
 *       401:
 *         description: Unauthorized
 */
router.get("/availability", authenticate, authorizeDoctor, getAvailability);

/**
 * @swagger
 * /api/doctor/availability:
 *   put:
 *     summary: Update doctor availability
 *     tags: [Doctor]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               availability:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     day:
 *                       type: string
 *                       example: Monday
 *                     startTime:
 *                       type: string
 *                       example: "09:00"
 *                     endTime:
 *                       type: string
 *                       example: "17:00"
 *               appointmentDuration:
 *                 type: integer
 *                 example: 60
 *     responses:
 *       200:
 *         description: Availability updated
 *       401:
 *         description: Unauthorized
 */
router.put("/availability", authenticate, authorizeDoctor, updateAvailabilityValidation, updateAvailability);

/**
 * @swagger
 * /api/doctor/dashboard:
 *   get:
 *     summary: Get doctor dashboard stats
 *     tags: [Doctor]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard stats returned
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 stats:
 *                   type: object
 *                   properties:
 *                     totalAppointments:
 *                       type: integer
 *                     pendingAppointments:
 *                       type: integer
 *                     completedAppointments:
 *                       type: integer
 *                     totalEarnings:
 *                       type: number
 *       401:
 *         description: Unauthorized
 */
router.get("/dashboard", authenticate, authorizeDoctor, getDashboardStats);

/**
 * @swagger
 * /api/doctor/earnings:
 *   get:
 *     summary: Get doctor earnings from paid appointments
 *     tags: [Doctor]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Earnings returned
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 total:
 *                   type: number
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       appointmentId:
 *                         type: integer
 *                       patientName:
 *                         type: string
 *                       date:
 *                         type: string
 *                       amount:
 *                         type: number
 *                       status:
 *                         type: string
 *       401:
 *         description: Unauthorized
 */
router.get("/earnings", authenticate, authorizeDoctor, getDoctorEarnings);

export default router;