import { Router } from "express";
import { body }   from "express-validator";
import { authenticate, authorizePatient } from "../middlewares/auth.middleware.js";
import { makePayment, getPaymentByAppointment, getMyPayments, refundPayment } from "../controllers/payment.controller.js";
import validate from "../middlewares/validate.middleware.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Patient billing and payment endpoints
 */

/**
 * @swagger
 * /api/payments:
 *   post:
 *     summary: Make a payment for an appointment
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [appointmentId, cardName, cardNumber, expiry, cvv]
 *             properties:
 *               appointmentId:
 *                 type: integer
 *                 example: 1
 *               cardName:
 *                 type: string
 *                 example: John Doe
 *               cardNumber:
 *                 type: string
 *                 example: "4111111111111111"
 *               expiry:
 *                 type: string
 *                 example: "12/26"
 *               cvv:
 *                 type: string
 *                 example: "123"
 *     responses:
 *       201:
 *         description: Payment successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 payment:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     amount:
 *                       type: number
 *                     cardLast4:
 *                       type: string
 *                     status:
 *                       type: string
 *                     paidAt:
 *                       type: string
 *       400:
 *         description: Validation error or already paid
 *       401:
 *         description: Unauthorized
 */
router.post(
  "/",
  authenticate,
  authorizePatient,
  [
    body("appointmentId").notEmpty().withMessage("Appointment ID is required"),
    body("cardName").notEmpty().withMessage("Card name is required"),
    body("cardNumber").notEmpty().withMessage("Card number is required"),
    body("expiry").notEmpty().withMessage("Expiry is required"),
    body("cvv").notEmpty().withMessage("CVV is required"),
  ],
  validate,
  makePayment
);

/**
 * @swagger
 * /api/payments/my:
 *   get:
 *     summary: Get all payments for logged in patient
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of payments
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 payments:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       appointmentId:
 *                         type: integer
 *                       amount:
 *                         type: number
 *                       cardLast4:
 *                         type: string
 *                       status:
 *                         type: string
 *                       paidAt:
 *                         type: string
 *       401:
 *         description: Unauthorized
 */
router.get("/my", authenticate, authorizePatient, getMyPayments);

/**
 * @swagger
 * /api/payments/appointment/{appointmentId}:
 *   get:
 *     summary: Get payment for a specific appointment
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: appointmentId
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Payment details returned
 *       404:
 *         description: Payment not found
 *       401:
 *         description: Unauthorized
 */
router.get("/appointment/:appointmentId", authenticate, authorizePatient, getPaymentByAppointment);

/**
 * @swagger
 * /api/payments/{id}/refund:
 *   delete:
 *     summary: Refund a payment
 *     tags: [Payments]
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
 *         description: Payment refunded successfully
 *       404:
 *         description: Payment not found
 *       401:
 *         description: Unauthorized
 */
router.delete("/:id/refund", authenticate, authorizePatient, refundPayment);

export default router;