import { Router } from "express";
import { body }   from "express-validator";
import { authenticate, authorizeDoctor } from "../middlewares/auth.middleware.js";
import {
  getDoctorAppointments,
  updateAppointmentStatus,
  addAppointmentNotes,
  getPatientNotes,
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

// PATCH /api/doctor/appointments/:id/notes
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
// GET /api/doctor/patients/:patientId/notes
router.get(
  "/patients/:patientId/notes",
  authenticate,
  authorizeDoctor,
  getPatientNotes
);
export default router;