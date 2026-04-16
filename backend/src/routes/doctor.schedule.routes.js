import { Router } from "express";
import { body, query } from "express-validator";
import { authenticate, authorizeDoctor } from "../middlewares/auth.middleware.js";
import {
  getWeeklySchedule,
  blockSlot,
  unblockSlot,
} from "../controllers/doctor.schedule.controller.js";
import validate from "../middlewares/validate.middleware.js";

const router = Router();

// GET /api/doctor/schedule
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

// POST /api/doctor/schedule/block
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

// DELETE /api/doctor/schedule/block/:id
router.delete(
  "/schedule/block/:id",
  authenticate,
  authorizeDoctor,
  unblockSlot
);

export default router;