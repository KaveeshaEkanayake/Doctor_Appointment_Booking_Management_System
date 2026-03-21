import prisma from "../lib/prisma.js";

// POST /api/appointments
export const createAppointment = async (req, res) => {
  const { doctorId, date, time, reason } = req.body;

  try {
    // Check doctor exists and is approved
    const doctor = await prisma.doctor.findUnique({
      where: { id: parseInt(doctorId) },
    });

    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    if (doctor.status !== "APPROVED" || doctor.profileStatus !== "APPROVED") {
      return res.status(400).json({ success: false, message: "Doctor is not available" });
    }

    // Fix timezone — use start/end of day
    const appointmentDate = new Date(date);
    const dateStr    = appointmentDate.toISOString().split("T")[0];
    const startOfDay = new Date(`${dateStr}T00:00:00.000Z`);
    const endOfDay   = new Date(`${dateStr}T23:59:59.999Z`);

    // Check slot is not already booked
    const existing = await prisma.appointment.findFirst({
      where: {
        doctorId: parseInt(doctorId),
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
        time,
        status: { notIn: ["CANCELLED"] },
      },
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: "This time slot is already booked",
      });
    }

    const appointment = await prisma.appointment.create({
      data: {
        patientId: req.user.id,
        doctorId:  parseInt(doctorId),
        date:      startOfDay,
        time,
        reason:    reason || null,
        status:    "PENDING",
      },
      include: {
        doctor: {
          select: {
            firstName:      true,
            lastName:       true,
            specialisation: true,
            profilePhoto:   true,
          },
        },
      },
    });

    return res.status(201).json({
      success: true,
      message: "Appointment booked successfully",
      appointment,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// GET /api/appointments/my
export const getMyAppointments = async (req, res) => {
  try {
    const appointments = await prisma.appointment.findMany({
      where: { patientId: req.user.id },
      include: {
        doctor: {
          select: {
            firstName:      true,
            lastName:       true,
            specialisation: true,
            profilePhoto:   true,
          },
        },
      },
      orderBy: { date: "desc" },
    });

    const formatted = appointments.map((appt) => ({
      id:             appt.id,
      doctorName:     `Dr. ${appt.doctor.firstName} ${appt.doctor.lastName}`,
      specialisation: appt.doctor.specialisation,
      profilePhoto:   appt.doctor.profilePhoto,
      date:           appt.date,
      time:           appt.time,
      reason:         appt.reason,
      status:         appt.status.charAt(0) + appt.status.slice(1).toLowerCase(),
    }));

    return res.status(200).json({ success: true, appointments: formatted });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// GET /api/appointments/booked-slots/:doctorId/:date
export const getBookedSlots = async (req, res) => {
  const { doctorId, date } = req.params;

  try {
    const startOfDay = new Date(`${date}T00:00:00.000Z`);
    const endOfDay   = new Date(`${date}T23:59:59.999Z`);

    const appointments = await prisma.appointment.findMany({
      where: {
        doctorId: parseInt(doctorId),
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
        status: { notIn: ["CANCELLED"] },
      },
      select: { time: true },
    });

    const bookedSlots = appointments.map((a) => a.time);

    return res.status(200).json({ success: true, bookedSlots });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};