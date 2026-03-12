import bcrypt from "bcryptjs";
import prisma from "../lib/prisma.js";

export const registerPatient = async (req, res) => {
  // Step 1: Pull data from request body
  const { firstName, lastName, email, password, phone } = req.body;

  try {
    // Step 2: Hash the password before saving
    // 10 = how many times it scrambles the password (standard)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Step 3: Save the new patient to the database
    const newPatient = await prisma.patient.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        phone,
      },
    });

    // Step 4: Return success response (never send password back)
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
    // Step 5: Handle duplicate email error
    // P2002 is Prisma's error code for unique constraint violation
    if (error.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: "Email already exists. Please use a different email.",
      });
    }

    // Step 6: Handle any other unexpected errors
    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
    });
  }
};