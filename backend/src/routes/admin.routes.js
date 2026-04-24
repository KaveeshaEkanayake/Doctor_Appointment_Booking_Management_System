import { Router } from "express";
import { body }   from "express-validator";
import {
  adminLogin,
  getDoctors,
  getDoctorCounts,
  updateDoctorStatus,
  getDoctorProfiles,
  updateDoctorProfileStatus,
  getPatients,
  togglePatientStatus,
  deletePatient,
  getAdminLogs,
  toggleDoctorStatus,
  deleteDoctor,
} from "../controllers/admin.controller.js";
import { authenticate, authorizeAdmin } from "../middlewares/auth.middleware.js";
import validate from "../middlewares/validate.middleware.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Admin management endpoints
 */

/**
 * @swagger
 * /api/admin/login:
 *   post:
 *     summary: Admin login
 *     tags: [Admin]
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
 *                 example: admin@dams.com
 *               password:
 *                 type: string
 *                 example: Admin@1234
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email required"),
    body("password").notEmpty().withMessage("Password required"),
  ],
  validate,
  adminLogin
);

/**
 * @swagger
 * /api/admin/doctors/counts:
 *   get:
 *     summary: Get doctor counts by status
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Doctor counts returned
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 counts:
 *                   type: object
 *                   properties:
 *                     pending:
 *                       type: integer
 *                     approved:
 *                       type: integer
 *                     rejected:
 *                       type: integer
 *                     pendingProfiles:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 */
router.get("/doctors/counts", authenticate, authorizeAdmin, getDoctorCounts);

/**
 * @swagger
 * /api/admin/doctors:
 *   get:
 *     summary: Get all doctors by status
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, APPROVED, REJECTED, SUSPENDED]
 *         description: Filter doctors by status
 *     responses:
 *       200:
 *         description: List of doctors
 *       401:
 *         description: Unauthorized
 */
router.get("/doctors", authenticate, authorizeAdmin, getDoctors);

/**
 * @swagger
 * /api/admin/doctors/{id}/status:
 *   patch:
 *     summary: Approve or reject a doctor account
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [APPROVED, REJECTED]
 *     responses:
 *       200:
 *         description: Doctor status updated
 *       404:
 *         description: Doctor not found
 */
router.patch("/doctors/:id/status", authenticate, authorizeAdmin, updateDoctorStatus);

/**
 * @swagger
 * /api/admin/profiles:
 *   get:
 *     summary: Get doctor profiles by profile status
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: profileStatus
 *         schema:
 *           type: string
 *           enum: [PENDING_REVIEW, APPROVED, REJECTED]
 *     responses:
 *       200:
 *         description: List of doctor profiles
 *       401:
 *         description: Unauthorized
 */
router.get("/profiles", authenticate, authorizeAdmin, getDoctorProfiles);

/**
 * @swagger
 * /api/admin/doctors/{id}/profileStatus:
 *   patch:
 *     summary: Approve or reject a doctor profile
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               profileStatus:
 *                 type: string
 *                 enum: [APPROVED, REJECTED]
 *     responses:
 *       200:
 *         description: Profile status updated
 *       404:
 *         description: Doctor not found
 */
router.patch("/doctors/:id/profileStatus", authenticate, authorizeAdmin, updateDoctorProfileStatus);

/**
 * @swagger
 * /api/admin/patients/logs:
 *   get:
 *     summary: Get admin activity logs
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of admin logs
 *       401:
 *         description: Unauthorized
 */
router.get("/patients/logs", authenticate, authorizeAdmin, getAdminLogs);

/**
 * @swagger
 * /api/admin/patients:
 *   get:
 *     summary: Get all patients
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by name or email
 *     responses:
 *       200:
 *         description: List of patients
 *       401:
 *         description: Unauthorized
 */
router.get("/patients", authenticate, authorizeAdmin, getPatients);

/**
 * @swagger
 * /api/admin/patients/{id}/suspend:
 *   patch:
 *     summary: Suspend or activate a patient account
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Patient status toggled
 *       404:
 *         description: Patient not found
 */
router.patch("/patients/:id/suspend", authenticate, authorizeAdmin, togglePatientStatus);

/**
 * @swagger
 * /api/admin/patients/{id}:
 *   delete:
 *     summary: Permanently delete a patient account
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Patient deleted successfully
 *       404:
 *         description: Patient not found
 */
router.delete("/patients/:id", authenticate, authorizeAdmin, deletePatient);

/**
 * @swagger
 * /api/admin/doctors/{id}/suspend:
 *   patch:
 *     summary: Suspend or activate a doctor account
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Doctor status toggled
 *       404:
 *         description: Doctor not found
 */
router.patch("/doctors/:id/suspend", authenticate, authorizeAdmin, toggleDoctorStatus);

/**
 * @swagger
 * /api/admin/doctors/{id}:
 *   delete:
 *     summary: Permanently delete a doctor account
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Doctor deleted successfully
 *       404:
 *         description: Doctor not found
 */
router.delete("/doctors/:id", authenticate, authorizeAdmin, deleteDoctor);

export default router;