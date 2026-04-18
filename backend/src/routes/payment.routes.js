import { Router } from "express";
import { body }   from "express-validator";
import { authenticate, authorizePatient } from "../middlewares/auth.middleware.js";
import { makePayment, getPaymentByAppointment, getMyPayments, refundPayment} from "../controllers/payment.controller.js";
import validate from "../middlewares/validate.middleware.js";


const router = Router();

// POST /api/payments
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

// GET /api/payments/my
router.get(
  "/my",
  authenticate,
  authorizePatient,
  getMyPayments
);

// GET /api/payments/appointment/:appointmentId
router.get(
  "/appointment/:appointmentId",
  authenticate,
  authorizePatient,
  getPaymentByAppointment
);

// DELETE /api/payments/:id/refund
router.delete(
  "/:id/refund",
  authenticate,
  authorizePatient,
  refundPayment
);
export default router;