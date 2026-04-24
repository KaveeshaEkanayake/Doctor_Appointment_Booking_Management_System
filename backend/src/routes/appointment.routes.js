import { Router }                from "express";
import { body, param }           from "express-validator";
import { authenticate, authorizePatient } from "../middlewares/auth.middleware.js";
import {
  createAppointment,
  getMyAppointments,
  getBookedSlots,
  rescheduleAppointment,
  cancelAppointment,
  getOutstandingBalance,
} from "../controllers/appointment.controller.js";
import validate from "../middlewares/validate.middleware.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Appointments
 *   description: Patient appointment endpoints
 */

/**
 * @swagger
 * /api/appointments/booked-slots/{doctorId}/{date}:
 *   get:
 *     summary: Get booked slots for a doctor on a specific date
 *     tags: [Appointments]
 *     parameters:
 *       - in: path
 *         name: doctorId
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *       - in: path
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *         example: "2026-04-23"
 *     responses:
 *       200:
 *         description: List of booked time slots
 *       400:
 *         description: Validation error
 */
router.get(
  "/booked-slots/:doctorId/:date",
  [
    param("doctorId").isInt().withMessage("Doctor ID must be an integer"),
    param("date").matches(/^\d{4}-\d{2}-\d{2}$/).withMessage("Date must be YYYY-MM-DD"),
  ],
  validate,
  getBookedSlots
);

/**
 * @swagger
 * /api/appointments/outstanding:
 *   get:
 *     summary: Get outstanding balance for patient
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Outstanding balance returned
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 total:
 *                   type: number
 *                 unpaidCount:
 *                   type: integer
 *       401:
 *         description: Unauthorized
 */
router.get("/outstanding", authenticate, authorizePatient, getOutstandingBalance);

/**
 * @swagger
 * /api/appointments:
 *   post:
 *     summary: Book a new appointment
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [doctorId, date, time]
 *             properties:
 *               doctorId:
 *                 type: integer
 *                 example: 1
 *               date:
 *                 type: string
 *                 example: "2026-04-29"
 *               time:
 *                 type: string
 *                 example: "10:00 AM"
 *               reason:
 *                 type: string
 *                 example: "Regular checkup"
 *     responses:
 *       201:
 *         description: Appointment booked successfully
 *       400:
 *         description: Validation error or slot unavailable
 *       401:
 *         description: Unauthorized
 */
router.post(
  "/",
  authenticate,
  authorizePatient,
  [
    body("doctorId").notEmpty().withMessage("Doctor ID is required").isInt().withMessage("Doctor ID must be an integer").toInt(),
    body("date").notEmpty().isISO8601().withMessage("Valid date is required"),
    body("time").notEmpty().withMessage("Time is required"),
    body("reason").optional().isString(),
  ],
  validate,
  createAppointment
);

/**
 * @swagger
 * /api/appointments/my:
 *   get:
 *     summary: Get all appointments for logged in patient
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of patient appointments
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
 *                       doctorName:
 *                         type: string
 *                       date:
 *                         type: string
 *                       time:
 *                         type: string
 *                       status:
 *                         type: string
 *                       notes:
 *                         type: string
 *       401:
 *         description: Unauthorized
 */
router.get("/my", authenticate, authorizePatient, getMyAppointments);

/**
 * @swagger
 * /api/appointments/{id}/reschedule:
 *   patch:
 *     summary: Reschedule an appointment
 *     tags: [Appointments]
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
 *             required: [date, time]
 *             properties:
 *               date:
 *                 type: string
 *                 example: "2026-04-30"
 *               time:
 *                 type: string
 *                 example: "11:00 AM"
 *     responses:
 *       200:
 *         description: Appointment rescheduled
 *       404:
 *         description: Appointment not found
 */
router.patch(
  "/:id/reschedule",
  authenticate,
  authorizePatient,
  [
    param("id").isInt().withMessage("Appointment ID must be an integer"),
    body("date").notEmpty().isISO8601().withMessage("Valid date is required"),
    body("time").notEmpty().withMessage("Time is required"),
  ],
  validate,
  rescheduleAppointment
);

/**
 * @swagger
 * /api/appointments/{id}/cancel:
 *   patch:
 *     summary: Cancel an appointment
 *     tags: [Appointments]
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
 *         description: Appointment cancelled
 *       404:
 *         description: Appointment not found
 */
router.patch(
  "/:id/cancel",
  authenticate,
  authorizePatient,
  [
    param("id").isInt().withMessage("Appointment ID must be an integer"),
  ],
  validate,
  cancelAppointment
);

export default router;