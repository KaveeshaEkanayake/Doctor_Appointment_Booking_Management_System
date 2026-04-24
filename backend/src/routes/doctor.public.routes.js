import express from "express";
import { getApprovedDoctors, getPublicDoctorProfile } from "../controllers/doctor.profile.controller.js";
import { getPublicAvailability } from "../controllers/availability.controller.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Doctors
 *   description: Public doctor endpoints
 */

/**
 * @swagger
 * /api/doctors:
 *   get:
 *     summary: Get all approved doctors
 *     tags: [Doctors]
 *     parameters:
 *       - in: query
 *         name: specialisation
 *         schema:
 *           type: string
 *         description: Filter by specialisation
 *     responses:
 *       200:
 *         description: List of approved doctors
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 doctors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       firstName:
 *                         type: string
 *                       lastName:
 *                         type: string
 *                       specialisation:
 *                         type: string
 *                       experience:
 *                         type: string
 *                       consultationFee:
 *                         type: number
 *                       profilePhoto:
 *                         type: string
 */
router.get("/", getApprovedDoctors);

/**
 * @swagger
 * /api/doctors/{id}:
 *   get:
 *     summary: Get public profile of a doctor
 *     tags: [Doctors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Doctor profile returned
 *       404:
 *         description: Doctor not found
 */
router.get("/:id", getPublicDoctorProfile);

/**
 * @swagger
 * /api/doctors/{id}/availability:
 *   get:
 *     summary: Get availability for a doctor
 *     tags: [Doctors]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Doctor availability returned
 *       404:
 *         description: Doctor not found
 */
router.get("/:id/availability", getPublicAvailability);

export default router;