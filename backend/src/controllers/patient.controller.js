import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";

const INVALID_CREDENTIALS_RESPONSE = {
  success: false,
  message: "Invalid credentials. Please check your email and password.",
};

export const registerPatient = async (req, res) => {
  const { firstName, lastName, email, password, phone } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const newPatient = await prisma.patient.create({
      data: { firstName, lastName, email, password: hashedPassword, phone },
    });

    return res.status(201).json({
      success: true,
      message: "Patient registered successfully",
      patient: {
        id:        newPatient.id,
        firstName: newPatient.firstName,
        lastName:  newPatient.lastName,
        email:     newPatient.email,
        phone:     newPatient.phone,
      },
    });

  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: "Email already exists. Please use a different email.",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
    });
  }
};

export const loginPatient = async (req, res) => {
  const { email, password } = req.body;

  try {
    const patient = await prisma.patient.findUnique({ where: { email } });

    if (!patient) return res.status(401).json(INVALID_CREDENTIALS_RESPONSE);

    const isPasswordCorrect = await bcrypt.compare(password, patient.password);
    if (!isPasswordCorrect) return res.status(401).json(INVALID_CREDENTIALS_RESPONSE);

    const token = jwt.sign(
      {
        id:    patient.id,
        email: patient.email,
        role:  "patient",
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      patient: {
        id:        patient.id,
        firstName: patient.firstName,
        lastName:  patient.lastName,
        email:     patient.email,
        phone:     patient.phone,
        role:      "patient",
      },
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
    });
  }
};

export const deletePatient = async (req, res) => {
  const patientId = req.user.id;

  try {
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
    });

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: "Patient not found.",
      });
    }

    await prisma.appointment.deleteMany({
      where: { patientId },
    });

    await prisma.patient.delete({
      where: { id: patientId },
    });

    return res.status(200).json({
      success: true,
      message: "Account deleted successfully.",
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
    });
  }
};