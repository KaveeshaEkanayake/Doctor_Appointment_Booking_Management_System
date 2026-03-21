import prisma from "../lib/prisma.js";

// GET /api/patient/profile
export const getPatientProfile = async (req, res) => {
  try {
    const patient = await prisma.patient.findUnique({
      where: { id: req.user.id },
      select: {
        id:          true,
        firstName:   true,
        lastName:    true,
        email:       true,
        phone:       true,
        address:     true,
        dateOfBirth: true,
        createdAt:   true,
      },
    });

    if (!patient) {
      return res.status(404).json({ success: false, message: "Patient not found" });
    }

    return res.status(200).json({ success: true, patient });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// PUT /api/patient/profile
export const updatePatientProfile = async (req, res) => {
  const { firstName, lastName, phone, address, dateOfBirth } = req.body;

  try {
    const patient = await prisma.patient.findUnique({
      where: { id: req.user.id },
    });

    if (!patient) {
      return res.status(404).json({ success: false, message: "Patient not found" });
    }

    const updated = await prisma.patient.update({
      where: { id: req.user.id },
      data: {
        ...(firstName   !== undefined && { firstName }),
        ...(lastName    !== undefined && { lastName }),
        ...(phone       !== undefined && { phone }),
        ...(address     !== undefined && { address }),
        ...(dateOfBirth !== undefined && { dateOfBirth: new Date(dateOfBirth) }),
      },
      select: {
        id:          true,
        firstName:   true,
        lastName:    true,
        email:       true,
        phone:       true,
        address:     true,
        dateOfBirth: true,
        updatedAt:   true,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      patient: updated,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};