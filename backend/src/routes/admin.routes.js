import { Router } from "express";
import { body }   from "express-validator";
import {
  adminLogin,
  getDoctors,
  getDoctorCounts,
  updateDoctorStatus,
  getDoctorProfiles,
  updateDoctorProfileStatus,
  getPatients,
  togglePatientStatus,
  deletePatient,
  getAdminLogs,
  toggleDoctorStatus,
  deleteDoctor,
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

// Doctor routes
router.get(   "/doctors/counts",            authenticate, authorizeAdmin, getDoctorCounts);
router.get(   "/doctors",                   authenticate, authorizeAdmin, getDoctors);
router.patch( "/doctors/:id/status",        authenticate, authorizeAdmin, updateDoctorStatus);
router.get(   "/profiles",                  authenticate, authorizeAdmin, getDoctorProfiles);
router.patch( "/doctors/:id/profileStatus", authenticate, authorizeAdmin, updateDoctorProfileStatus);

// Patient routes — logs MUST be before /:id
router.get(    "/patients/logs",        authenticate, authorizeAdmin, getAdminLogs);
router.get(    "/patients",             authenticate, authorizeAdmin, getPatients);
router.patch(  "/patients/:id/suspend", authenticate, authorizeAdmin, togglePatientStatus);
router.delete( "/patients/:id",         authenticate, authorizeAdmin, deletePatient);

router.patch(  "/doctors/:id/suspend", authenticate, authorizeAdmin, toggleDoctorStatus);
router.delete( "/doctors/:id",         authenticate, authorizeAdmin, deleteDoctor);

export default router;