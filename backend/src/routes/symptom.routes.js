import { Router } from "express";
import { body }   from "express-validator";
import { analyseSymptoms } from "../controllers/symptom.controller.js";
import validate from "../middlewares/validate.middleware.js";

const router = Router();

// POST /api/symptom-checker
router.post(
  "/",
  [
    body("symptoms")
      .isArray({ min: 1 })
      .withMessage("At least one symptom is required"),
    body("symptoms.*")
      .isString()
      .trim()
      .notEmpty()
      .withMessage("Each symptom must be a non-empty string"),
  ],
  validate,
  analyseSymptoms
);

export default router;