import { Router } from "express";
import { body }   from "express-validator";
import {
  adminLogin,
  getDoctors,
  getDoctorCounts,
  updateDoctorStatus,
  getDoctorProfiles,
  updateDoctorProfileStatus,
} from "../controllers/admin.controller.js";
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

// Protected — counts MUST be before /:id routes
router.get(   "/doctors/counts",            authenticate, authorizeAdmin, getDoctorCounts);
router.get(   "/doctors",                   authenticate, authorizeAdmin, getDoctors);
router.patch( "/doctors/:id/status",        authenticate, authorizeAdmin, updateDoctorStatus);

// Profile review routes
router.get(   "/profiles",                  authenticate, authorizeAdmin, getDoctorProfiles);
router.patch( "/doctors/:id/profileStatus", authenticate, authorizeAdmin, updateDoctorProfileStatus);

export default router;