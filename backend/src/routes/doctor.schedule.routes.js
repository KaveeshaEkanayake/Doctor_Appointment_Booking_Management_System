import { Router }        from "express";
import { body, query }   from "express-validator";
import { authenticate, authorizeDoctor } from "../middlewares/auth.middleware.js";
import {
  getWeeklySchedule,
  blockSlot,
  unblockSlot,
} from "../controllers/doctor.schedule.controller.js";
import validate from "../middlewares/validate.middleware.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Doctor Schedule
 *   description: Doctor schedule and slot management endpoints
 */

/**
 * @swagger
 * /api/doctor/schedule:
 *   get:
 *     summary: Get weekly schedule for doctor
 *     tags: [Doctor Schedule]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *         example: "2026-04-21"
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *         example: "2026-04-27"
 *     responses:
 *       200:
 *         description: Weekly schedule returned
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 appointments:
 *                   type: array
 *                 blockedSlots:
 *                   type: array
 *       401:
 *         description: Unauthorized
 */
router.get(
  "/schedule",
  authenticate,
  authorizeDoctor,
  [
    query("startDate").notEmpty().withMessage("startDate is required"),
    query("endDate").notEmpty().withMessage("endDate is required"),
  ],
  validate,
  getWeeklySchedule
);

/**
 * @swagger
 * /api/doctor/schedule/block:
 *   post:
 *     summary: Block a time slot
 *     tags: [Doctor Schedule]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [date, startTime, endTime, reason]
 *             properties:
 *               date:
 *                 type: string
 *                 example: "2026-04-25"
 *               startTime:
 *                 type: string
 *                 example: "09:00"
 *               endTime:
 *                 type: string
 *                 example: "10:00"
 *               reason:
 *                 type: string
 *                 example: Lunch break
 *     responses:
 *       201:
 *         description: Slot blocked successfully
 *       401:
 *         description: Unauthorized
 */
router.post(
  "/schedule/block",
  authenticate,
  authorizeDoctor,
  [
    body("date").notEmpty().withMessage("date is required"),
    body("startTime").notEmpty().withMessage("startTime is required"),
    body("endTime").notEmpty().withMessage("endTime is required"),
    body("reason").notEmpty().withMessage("reason is required"),
  ],
  validate,
  blockSlot
);

/**
 * @swagger
 * /api/doctor/schedule/block/{id}:
 *   delete:
 *     summary: Unblock a time slot
 *     tags: [Doctor Schedule]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Slot unblocked successfully
 *       404:
 *         description: Blocked slot not found
 *       401:
 *         description: Unauthorized
 */
router.delete(
  "/schedule/block/:id",
  authenticate,
  authorizeDoctor,
  unblockSlot
);

export default router;