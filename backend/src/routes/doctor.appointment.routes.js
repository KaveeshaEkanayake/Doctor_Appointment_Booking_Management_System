import { Router } from "express";
import { body }   from "express-validator";
import { authenticate, authorizeDoctor } from "../middlewares/auth.middleware.js";
import {
  getDoctorAppointments,
  updateAppointmentStatus,
} from "../controllers/doctor.appointment.controller.js";
import validate from "../middlewares/validate.middleware.js";

const router = Router();

router.get(
  "/appointments",
  authenticate,
  authorizeDoctor,
  getDoctorAppointments
);

router.patch(
  "/appointments/:id/status",
  authenticate,
  authorizeDoctor,
  [
    body("status")
      .notEmpty().withMessage("Status is required")
      .isIn(["CONFIRMED", "CANCELLED"]).withMessage("Status must be CONFIRMED or CANCELLED"),
    body("rejectionReason").optional().isString(),
  ],
  validate,
  updateAppointmentStatus
);

export default router;