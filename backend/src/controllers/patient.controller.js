import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";

// Validate JWT_SECRET at startup — fails early with a clear message
// Similar to DATABASE_URL check in prisma.js
if (!process.env.JWT_SECRET) {
  throw new Error(
    "JWT_SECRET environment variable is not set. Please configure JWT_SECRET before starting the application."
  );
}

// Shared constant to avoid duplicating the invalid credentials response
// Both "user not found" and "wrong password" return the same message
// This is intentional — we don't reveal which field is wrong (security)
const INVALID_CREDENTIALS_RESPONSE = {
  success: false,
  message: "Invalid credentials. Please check your email and password.",
};

export const registerPatient = async (req, res) => {
  const { firstName, lastName, email, password, phone } = req.body;

  try {
    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save new patient to database
    const newPatient = await prisma.patient.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        phone,
      },
    });

    // Return success response (never send password back)
    return res.status(201).json({
      success: true,
      message: "Patient registered successfully",
      patient: {
        id: newPatient.id,
        firstName: newPatient.firstName,
        lastName: newPatient.lastName,
        email: newPatient.email,
        phone: newPatient.phone,
      },
    });

  } catch (error) {
    // P2002 is Prisma's error code for duplicate unique field
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
    // Step 1: Check if patient exists with this email
    const patient = await prisma.patient.findUnique({
      where: { email },
    });

    // Step 2: If no patient found, return shared error constant
    if (!patient) {
      return res.status(401).json(INVALID_CREDENTIALS_RESPONSE);
    }

    // Step 3: Compare entered password with hashed password in database
    const isPasswordCorrect = await bcrypt.compare(password, patient.password);

    // Step 4: If password wrong, return same shared error constant
    if (!isPasswordCorrect) {
      return res.status(401).json(INVALID_CREDENTIALS_RESPONSE);
    }

    // Step 5: Generate JWT token
    const token = jwt.sign(
      {
        id: patient.id,
        email: patient.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Step 6: Return success with token and patient info
    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      patient: {
        id: patient.id,
        firstName: patient.firstName,
        lastName: patient.lastName,
        email: patient.email,
        phone: patient.phone,
      },
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
    });
  }
};