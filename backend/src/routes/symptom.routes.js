import { Router } from "express";
import { body }   from "express-validator";
import { analyseSymptoms } from "../controllers/symptom.controller.js";
import validate from "../middlewares/validate.middleware.js";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Symptom Checker
 *   description: AI powered symptom checker endpoints
 */

/**
 * @swagger
 * /api/symptom-checker:
 *   post:
 *     summary: Analyse symptoms using AI and get specialist recommendation
 *     tags: [Symptom Checker]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [symptoms]
 *             properties:
 *               symptoms:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Fever", "Headache", "Nausea"]
 *     responses:
 *       200:
 *         description: AI analysis returned
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 analysis:
 *                   type: object
 *                   properties:
 *                     specialisation:
 *                       type: string
 *                       example: Neurology
 *                     confidence:
 *                       type: string
 *                       example: "87%"
 *                     urgency:
 *                       type: string
 *                       enum: [Low, Medium, High, Emergency]
 *                     possibleConditions:
 *                       type: array
 *                       items:
 *                         type: string
 *                     whatToExpect:
 *                       type: string
 *                     dos:
 *                       type: array
 *                       items:
 *                         type: string
 *                     donts:
 *                       type: array
 *                       items:
 *                         type: string
 *       400:
 *         description: Validation error
 *       500:
 *         description: AI analysis failed
 */
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