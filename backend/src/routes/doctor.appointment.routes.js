import { Router } from "express";
import { body }   from "express-validator";
import { authenticate, authorizeDoctor } from "../middlewares/auth.middleware.js";
import {
  getDoctorAppointments,
  updateAppointmentStatus,
  addAppointmentNotes,
  getPatientNotes,
  completeAppointment,
} from "../controllers/doctor.appointment.controller.js";
import validate from "../middlewares/validate.middleware.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Doctor Appointments
 *   description: Doctor appointment management endpoints
 */

/**
 * @swagger
 * /api/doctor/appointments:
 *   get:
 *     summary: Get all appointments for logged in doctor
 *     tags: [Doctor Appointments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of doctor appointments
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 appointments:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       patientName:
 *                         type: string
 *                       date:
 *                         type: string
 *                       time:
 *                         type: string
 *                       status:
 *                         type: string
 *                       reason:
 *                         type: string
 *       401:
 *         description: Unauthorized
 */
router.get("/appointments", authenticate, authorizeDoctor, getDoctorAppointments);

/**
 * @swagger
 * /api/doctor/appointments/{id}/status:
 *   patch:
 *     summary: Confirm or cancel an appointment
 *     tags: [Doctor Appointments]
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
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [CONFIRMED, CANCELLED]
 *               rejectionReason:
 *                 type: string
 *                 example: Doctor unavailable
 *     responses:
 *       200:
 *         description: Appointment status updated
 *       404:
 *         description: Appointment not found
 *       401:
 *         description: Unauthorized
 */
router.patch(
  "/appointments/:id/status",
  authenticate,
  authorizeDoctor,
  [
    body("status").notEmpty().withMessage("Status is required")
      .isIn(["CONFIRMED", "CANCELLED"]).withMessage("Status must be CONFIRMED or CANCELLED"),
    body("rejectionReason").optional().isString(),
  ],
  validate,
  updateAppointmentStatus
);

/**
 * @swagger
 * /api/doctor/appointments/{id}/notes:
 *   patch:
 *     summary: Add notes to an appointment
 *     tags: [Doctor Appointments]
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
 *             required: [notes]
 *             properties:
 *               notes:
 *                 type: string
 *                 example: Patient needs follow-up in 2 weeks
 *     responses:
 *       200:
 *         description: Notes added successfully
 *       404:
 *         description: Appointment not found
 *       401:
 *         description: Unauthorized
 */
router.patch(
  "/appointments/:id/notes",
  authenticate,
  authorizeDoctor,
  [
    body("notes").notEmpty().withMessage("Notes cannot be empty"),
  ],
  validate,
  addAppointmentNotes
);

/**
 * @swagger
 * /api/doctor/patients/{patientId}/notes:
 *   get:
 *     summary: Get all notes for a patient
 *     tags: [Doctor Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Patient notes returned
 *       401:
 *         description: Unauthorized
 */
router.get("/patients/:patientId/notes", authenticate, authorizeDoctor, getPatientNotes);

/**
 * @swagger
 * /api/doctor/appointments/{id}/complete:
 *   patch:
 *     summary: Mark an appointment as complete
 *     tags: [Doctor Appointments]
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
 *         description: Appointment marked as complete
 *       404:
 *         description: Appointment not found
 *       401:
 *         description: Unauthorized
 */
router.patch("/appointments/:id/complete", authenticate, authorizeDoctor, completeAppointment);

export default router;