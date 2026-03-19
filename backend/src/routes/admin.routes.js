import { Router } from "express";
import { body }   from "express-validator";
import { adminLogin, getDoctors, updateDoctorStatus } from "../controllers/admin.controller.js";
import { authenticate, authorizeAdmin } from "../middlewares/auth.middleware.js";
import validate from "../middlewares/validate.middleware.js"; 

const router = Router();

// Public
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email required"),
    body("password").notEmpty().withMessage("Password required"),
  ],
  validate,
  adminLogin
);

// Protected — admin only
router.get(   "/doctors",             authenticate, authorizeAdmin, getDoctors);
router.patch( "/doctors/:id/status",  authenticate, authorizeAdmin, updateDoctorStatus);

export default router;