import { Router } from "express";
import { body }   from "express-validator";
import { authenticate, authorizePatient } from "../middlewares/auth.middleware.js";
import { getPatientProfile, updatePatientProfile } from "../controllers/patient.profile.controller.js";
import validate from "../middlewares/validate.middleware.js";
import { getPatientDashboardStats } from "../controllers/patient.dashboard.controller.js";
import { deletePatient } from "../controllers/patient.controller.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Patient
 *   description: Patient protected endpoints
 */

/**
 * @swagger
 * /api/patient/profile:
 *   get:
 *     summary: Get logged in patient profile
 *     tags: [Patient]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Patient profile returned
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 patient:
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
 *                     phone:
 *                       type: string
 *                     address:
 *                       type: string
 *                     dateOfBirth:
 *                       type: string
 *       401:
 *         description: Unauthorized
 */
router.get("/profile", authenticate, authorizePatient, getPatientProfile);

/**
 * @swagger
 * /api/patient/profile:
 *   put:
 *     summary: Update patient profile
 *     tags: [Patient]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *               dateOfBirth:
 *                 type: string
 *                 example: "1995-05-15"
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       401:
 *         description: Unauthorized
 */
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

/**
 * @swagger
 * /api/patient/dashboard:
 *   get:
 *     summary: Get patient dashboard stats
 *     tags: [Patient]
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
 *                     upcomingAppointments:
 *                       type: integer
 *                     completedAppointments:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 */
router.get("/dashboard", authenticate, authorizePatient, getPatientDashboardStats);

/**
 * @swagger
 * /api/patient/account:
 *   delete:
 *     summary: Delete patient account permanently
 *     tags: [Patient]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Account deleted successfully
 *       401:
 *         description: Unauthorized
 */
router.delete("/account", authenticate, authorizePatient, deletePatient);

export default router;