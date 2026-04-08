import { Router } from "express";
import { body, param } from "express-validator";
import { authenticate, authorizePatient } from "../middlewares/auth.middleware.js";
import {
  createAppointment,
  getMyAppointments,
  getBookedSlots,
  rescheduleAppointment,
  cancelAppointment,
} from "../controllers/appointment.controller.js";
import validate from "../middlewares/validate.middleware.js";

const router = Router();

// Public — get booked slots for a doctor on a date
router.get(
  "/booked-slots/:doctorId/:date",
  [
    param("doctorId").isInt().withMessage("Doctor ID must be an integer"),
    param("date").matches(/^\d{4}-\d{2}-\d{2}$/).withMessage("Date must be YYYY-MM-DD"),
  ],
  validate,
  getBookedSlots
);

// Patient protected
router.post(
  "/",
  authenticate,
  authorizePatient,
  [
    body("doctorId")
      .notEmpty().withMessage("Doctor ID is required")
      .isInt().withMessage("Doctor ID must be an integer")
      .toInt(),
    body("date")
      .notEmpty()
      .isISO8601().withMessage("Valid date is required"),
    body("time")
      .notEmpty().withMessage("Time is required"),
    body("reason").optional().isString(),
  ],
  validate,
  createAppointment
);

router.get("/my", authenticate, authorizePatient, getMyAppointments);

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