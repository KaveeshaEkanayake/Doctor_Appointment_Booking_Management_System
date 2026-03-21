import { Router } from "express";
import { body }   from "express-validator";
import { authenticate, authorizePatient } from "../middlewares/auth.middleware.js";
import {
  createAppointment,
  getMyAppointments,
  getBookedSlots,
} from "../controllers/appointment.controller.js";
import validate from "../middlewares/validate.middleware.js";

const router = Router();

// Public — get booked slots for a doctor on a date
router.get("/booked-slots/:doctorId/:date", getBookedSlots);

// Patient protected
router.post(
  "/",
  authenticate,
  authorizePatient,
  [
    body("doctorId").notEmpty().withMessage("Doctor ID is required"),
    body("date").notEmpty().isISO8601().withMessage("Valid date is required"),
    body("time").notEmpty().withMessage("Time is required"),
    body("reason").optional().isString(),
  ],
  validate,
  createAppointment
);

router.get("/my", authenticate, authorizePatient, getMyAppointments);

export default router;