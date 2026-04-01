import prisma from "../lib/prisma.js";
import { validationResult } from "express-validator";

const VALID_DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];
const VALID_DURATIONS = [15, 30, 60];

// GET /api/doctor/availability
export const getAvailability = async (req, res) => {
  try {
    const doctor = await prisma.doctor.findUnique({
      where: { id: req.user.id },
      select: {
        appointmentDuration: true,
        availability: {
          select: {
            id: true,
            day: true,
            startTime: true,
            endTime: true,
            isActive: true
          },
          orderBy: { day: "asc" }
        }
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
      appointmentDuration: doctor.appointmentDuration,
      availability: doctor.availability
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// PUT /api/doctor/availability
export const updateAvailability = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }

  const { availability, appointmentDuration } = req.body;

  // Validate appointment duration
  if (appointmentDuration !== undefined && !VALID_DURATIONS.includes(appointmentDuration)) {
    return res.status(400).json({
      success: false,
      message: "Appointment duration must be 15, 30, or 60 minutes"
    });
  }

  // Validate availability slots
  if (availability) {
    for (const slot of availability) {
      if (!VALID_DAYS.includes(slot.day)) {
        return res.status(400).json({
          success: false,
          message: `Invalid day: ${slot.day}`
        });
      }

      const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
      if (!timeRegex.test(slot.startTime) || !timeRegex.test(slot.endTime)) {
        return res.status(400).json({
          success: false,
          message: "Time must be in HH:MM format (24-hour)"
        });
      }

      if (slot.startTime >= slot.endTime) {
        return res.status(400).json({
          success: false,
          message: `Start time must be before end time for ${slot.day}`
        });
      }
    }
  }

  try {
    // Update appointment duration if provided
    if (appointmentDuration !== undefined) {
      await prisma.doctor.update({
        where: { id: req.user.id },
        data: { appointmentDuration }
      });
    }

    // Replace all availability slots (delete old + create new)
    if (availability) {
      await prisma.availability.deleteMany({
        where: { doctorId: req.user.id }
      });

      if (availability.length > 0) {
        await prisma.availability.createMany({
          data: availability.map((slot) => ({
            doctorId: req.user.id,
            day: slot.day,
            startTime: slot.startTime,
            endTime: slot.endTime,
            isActive: slot.isActive !== undefined ? slot.isActive : true
          }))
        });
      }
    }

    // Fetch updated data
    const doctor = await prisma.doctor.findUnique({
      where: { id: req.user.id },
      select: {
        appointmentDuration: true,
        availability: {
          select: {
            id: true,
            day: true,
            startTime: true,
            endTime: true,
            isActive: true
          },
          orderBy: { day: "asc" }
        }
      }
    });

    return res.status(200).json({
      success: true,
      message: "Availability updated successfully",
      appointmentDuration: doctor.appointmentDuration,
      availability: doctor.availability
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// GET /api/doctors/:id/availability (public)
export const getPublicAvailability = async (req, res) => {
  const { id } = req.params;
  const parsedId = parseInt(id);

  if (!Number.isInteger(parsedId) || parsedId <= 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid doctor ID"
    });
  }

  try {
    const doctor = await prisma.doctor.findFirst({
      where: { id: parsedId, status: "APPROVED" },
      select: {
        appointmentDuration: true,
        availability: {
          where: { isActive: true },
          select: {
            day: true,
            startTime: true,
            endTime: true
          },
          orderBy: { day: "asc" }
        }
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
      appointmentDuration: doctor.appointmentDuration,
      availability: doctor.availability
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

