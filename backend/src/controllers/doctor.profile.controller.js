import prisma from "../lib/prisma.js";
import { validationResult } from "express-validator";

// GET /api/doctor/profile
export const getProfile = async (req, res) => {
  try {
    const doctor = await prisma.doctor.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        specialisation: true,
        status: true,
        profilePhoto: true,
        bio: true,
        qualifications: true,
        experience: true,
        consultationFee: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found"
      });
    }

    return res.status(200).json({
      success: true,
      doctor
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// PUT /api/doctor/profile
export const updateProfile = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  const { profilePhoto, bio, qualifications, experience, consultationFee, specialisation } = req.body;

  try {
    const doctor = await prisma.doctor.findUnique({
      where: { id: req.user.id }
    });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found"
      });
    }

    const updatedDoctor = await prisma.doctor.update({
      where: { id: req.user.id },
      data: {
        ...(profilePhoto !== undefined && { profilePhoto }),
        ...(bio !== undefined && { bio }),
        ...(qualifications !== undefined && { qualifications }),
        ...(experience !== undefined && { experience }),
        ...(consultationFee !== undefined && { consultationFee: parseFloat(consultationFee) }),
        ...(specialisation !== undefined && { specialisation })
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        specialisation: true,
        status: true,
        profilePhoto: true,
        bio: true,
        qualifications: true,
        experience: true,
        consultationFee: true,
        updatedAt: true
      }
    });

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      doctor: updatedDoctor
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// GET /api/doctors/:id (public - for visitors)
export const getPublicDoctorProfile = async (req, res) => {
  const { id } = req.params;

  try {
    const doctor = await prisma.doctor.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        specialisation: true,
        profilePhoto: true,
        bio: true,
        qualifications: true,
        experience: true,
        consultationFee: true
      }
    });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found"
      });
    }

    return res.status(200).json({
      success: true,
      doctor
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// GET /api/doctors (public - list approved doctors)
export const getApprovedDoctors = async (req, res) => {
  try {
    const doctors = await prisma.doctor.findMany({
      where: { status: "APPROVED" },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        specialisation: true,
        profilePhoto: true,
        bio: true,
        consultationFee: true
      },
      orderBy: { createdAt: "desc" }
    });

    return res.status(200).json({
      success: true,
      doctors
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};