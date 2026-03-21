import prisma from "../lib/prisma.js";
import { validationResult } from "express-validator";

// GET /api/doctor/profile
export const getProfile = async (req, res) => {
  try {
    const doctor = await prisma.doctor.findUnique({
      where: { id: req.user.id },
      select: {
        id:             true,
        firstName:      true,
        lastName:       true,
        email:          true,
        phone:          true,
        specialisation: true,
        status:         true,
        profileStatus:  true,      // ← NEW
        profilePhoto:   true,
        bio:            true,
        qualifications: true,
        experience:     true,
        consultationFee:true,
        createdAt:      true,
        updatedAt:      true,
      },
    });

    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    return res.status(200).json({ success: true, doctor });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// PUT /api/doctor/profile
export const updateProfile = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const doctor = await prisma.doctor.findUnique({
      where: { id: req.user.id },
    });

    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    // Block profile update if account not approved
    if (doctor.status !== "APPROVED") {
      return res.status(403).json({
        success: false,
        message: "Your account must be approved before submitting your profile.",
      });
    }

    // Block re-submission if profile is already under review
    if (doctor.profileStatus === "PENDING_REVIEW") {
      return res.status(403).json({
        success: false,
        message: "Your profile is already under review. Please wait for admin approval.",
      });
    }

    const {
      profilePhoto,
      bio,
      qualifications,
      experience,
      consultationFee,
      specialisation,
    } = req.body;

    const updatedDoctor = await prisma.doctor.update({
      where: { id: req.user.id },
      data: {
        ...(profilePhoto    !== undefined && { profilePhoto }),
        ...(bio             !== undefined && { bio }),
        ...(qualifications  !== undefined && { qualifications }),
        ...(experience      !== undefined && { experience }),
        ...(consultationFee !== undefined && { consultationFee: parseFloat(consultationFee) }),
        ...(specialisation  !== undefined && { specialisation }),
        profileStatus: "PENDING_REVIEW",   // ← always set on save
      },
      select: {
        id:             true,
        firstName:      true,
        lastName:       true,
        email:          true,
        phone:          true,
        specialisation: true,
        status:         true,
        profileStatus:  true,
        profilePhoto:   true,
        bio:            true,
        qualifications: true,
        experience:     true,
        consultationFee:true,
        updatedAt:      true,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Profile submitted for review successfully.",
      doctor: updatedDoctor,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// GET /api/doctors/:id (public - only account APPROVED + profile APPROVED)
export const getPublicDoctorProfile = async (req, res) => {
  const { id } = req.params;
  const parsedId = parseInt(id);

  if (!Number.isInteger(parsedId) || parsedId <= 0) {
    return res.status(400).json({ success: false, message: "Invalid doctor ID" });
  }

  try {
    const doctor = await prisma.doctor.findFirst({
      where: {
        id:            parsedId,
        status:        "APPROVED",
        profileStatus: "APPROVED",   // ← NEW
      },
      select: {
        id:             true,
        firstName:      true,
        lastName:       true,
        specialisation: true,
        profilePhoto:   true,
        bio:            true,
        qualifications: true,
        experience:     true,
        consultationFee:true,
      },
    });

    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    return res.status(200).json({ success: true, doctor });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// GET /api/doctors (public - list approved doctors)
export const getApprovedDoctors = async (req, res) => {
  const { search, specialisation } = req.query;

  try {
    const doctors = await prisma.doctor.findMany({
      where: {
        status:        "APPROVED",
        profileStatus: "APPROVED",
        ...(specialisation && { specialisation }),
        ...(search && {
          OR: [
            { firstName: { contains: search, mode: "insensitive" } },
            { lastName:  { contains: search, mode: "insensitive" } },
          ],
        }),
      },
      select: {
        id:             true,
        firstName:      true,
        lastName:       true,
        specialisation: true,
        profilePhoto:   true,
        bio:            true,
        experience:     true,
        consultationFee:true,
      },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({ success: true, doctors });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};