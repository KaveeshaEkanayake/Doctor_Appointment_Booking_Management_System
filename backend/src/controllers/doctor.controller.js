import bcrypt from "bcryptjs";
import jwt    from "jsonwebtoken";
import prisma from "../lib/prisma.js";
import { validationResult } from "express-validator";

const INVALID_CREDENTIALS_RESPONSE = {
  success: false,
  message: "Invalid credentials"
};

// POST /api/auth/doctor/register
export const registerDoctor = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { firstName, lastName, email, password, phone, specialisation } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const doctor = await prisma.doctor.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        phone,
        specialisation,
        status: "PENDING"
      }
    });

    return res.status(201).json({
      success: true,
      message: "Doctor registered successfully. Your account is pending approval.",
      doctor: {
        id:             doctor.id,
        firstName:      doctor.firstName,
        lastName:       doctor.lastName,
        email:          doctor.email,
        phone:          doctor.phone,
        specialisation: doctor.specialisation,
        status:         doctor.status
      }
    });

  } catch (err) {
    if (err.code === "P2002") {
      return res.status(409).json({ success: false, message: "Email already exists" });
    }
    console.error(err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// POST /api/auth/doctor/login
export const loginDoctor = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    console.error("JWT_SECRET is not set");
    return res.status(500).json({ success: false, message: "Internal server error" });
  }

  const { email, password } = req.body;

  try {
    const doctor = await prisma.doctor.findUnique({ where: { email } });

    if (!doctor) {
      return res.status(401).json(INVALID_CREDENTIALS_RESPONSE);
    }

    const isPasswordValid = await bcrypt.compare(password, doctor.password);
    if (!isPasswordValid) {
      return res.status(401).json(INVALID_CREDENTIALS_RESPONSE);
    }

    if (doctor.status === "PENDING") {
      return res.status(403).json({
        success: false,
        message: "Your account is awaiting approval from the administrator"
      });
    }

    if (doctor.status === "REJECTED") {
      return res.status(403).json({
        success: false,
        message: "Your account has been rejected. Please contact support."
      });
    }

    const token = jwt.sign(
      { id: doctor.id, email: doctor.email, role: "doctor" },
      jwtSecret,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      doctor: {
        id:           doctor.id,
        firstName:    doctor.firstName,
        lastName:     doctor.lastName,
        email:        doctor.email,
        phone:        doctor.phone,
        profilePhoto: doctor.profilePhoto,
        role:         "doctor",
      },
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};
// GET /api/doctor/earnings
export const getDoctorEarnings = async (req, res) => {
  const doctorId = req.user.id;

  try {
    const appointments = await prisma.appointment.findMany({
      where: {
        doctorId,
        status: "PAID",
      },
      include: {
        payment: true,
        patient: {
          select: {
            firstName: true,
            lastName:  true,
          },
        },
      },
      orderBy: { date: "desc" },
    });

    const data = appointments.map((appt) => ({
      appointmentId: appt.id,
      patientName:   `${appt.patient.firstName} ${appt.patient.lastName}`,
      date:          appt.payment?.paidAt
        ? new Date(appt.payment.paidAt).toLocaleDateString("en-US", {
            month: "short", day: "numeric", year: "numeric",
          })
        : new Date(appt.date).toLocaleDateString("en-US", {
            month: "short", day: "numeric", year: "numeric",
          }),
      amount: appt.payment?.amount ?? 0,
      status: "Paid",
    }));

    const total = data.reduce((sum, e) => sum + e.amount, 0);

    return res.status(200).json({
      success: true,
      total,
      data,
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};