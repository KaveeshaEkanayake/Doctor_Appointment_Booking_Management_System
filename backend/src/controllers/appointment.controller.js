import prisma from "../lib/prisma.js";

// POST /api/appointments
export const createAppointment = async (req, res) => {
  const { doctorId, date, time, reason } = req.body;

  try {
    const doctor = await prisma.doctor.findUnique({
      where: { id: parseInt(doctorId) },
    });

    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    if (doctor.status !== "APPROVED" || doctor.profileStatus !== "APPROVED") {
      return res.status(400).json({ success: false, message: "Doctor is not available" });
    }

    const dateStr    = date.split("T")[0];
    const startOfDay = new Date(`${dateStr}T00:00:00.000Z`);
    const endOfDay   = new Date(`${dateStr}T23:59:59.999Z`);

    // Check slot not already booked — exclude CANCELLED
    const existing = await prisma.appointment.findFirst({
      where: {
        doctorId: parseInt(doctorId),
        date:     { gte: startOfDay, lte: endOfDay },
        time,
        status:   { notIn: ["CANCELLED"] },
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
      success:     true,
      message:     "Appointment booked successfully",
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
  id:              appt.id,
  doctorId:        appt.doctorId,
  doctorName:      `Dr. ${appt.doctor.firstName} ${appt.doctor.lastName}`,
  specialisation:  appt.doctor.specialisation,
  profilePhoto:    appt.doctor.profilePhoto,
  date:            appt.date,
  time:            appt.time,
  reason:          appt.reason,
  status:          appt.status.charAt(0) + appt.status.slice(1).toLowerCase(),
  rejectionReason: appt.rejectionReason,
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

  const doctorIdNum = Number(doctorId);
  if (!Number.isInteger(doctorIdNum)) {
    return res.status(400).json({ success: false, message: "Invalid doctorId" });
  }

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    return res.status(400).json({
      success: false,
      message: "Invalid date format, expected YYYY-MM-DD",
    });
  }

  try {
    const startOfDay = new Date(`${date}T00:00:00.000Z`);
    const endOfDay   = new Date(`${date}T23:59:59.999Z`);

    if (isNaN(startOfDay.getTime()) || isNaN(endOfDay.getTime())) {
      return res.status(400).json({ success: false, message: "Invalid date value" });
    }

    const appointments = await prisma.appointment.findMany({
      where: {
        doctorId: doctorIdNum,
        date:     { gte: startOfDay, lte: endOfDay },
        status:   { notIn: ["CANCELLED"] },
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
// PATCH /api/appointments/:id/reschedule
export const rescheduleAppointment = async (req, res) => {
  const { id }        = req.params;
  const { date, time } = req.body;

  const appointmentId = Number(id);
  if (!Number.isInteger(appointmentId) || appointmentId <= 0) {
    return res.status(400).json({ success: false, message: "Invalid appointment ID" });
  }

  if (!date || !time) {
    return res.status(400).json({ success: false, message: "Date and time are required" });
  }

  try {
    // Find the appointment and verify it belongs to the patient
    const appointment = await prisma.appointment.findFirst({
      where: { id: appointmentId, patientId: req.user.id },
    });

    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    // Only PENDING or CONFIRMED appointments can be rescheduled
    if (!["PENDING", "CONFIRMED"].includes(appointment.status)) {
      return res.status(400).json({
        success: false,
        message: "Only pending or confirmed appointments can be rescheduled",
      });
    }

    // Appointment must be in the future
    const now = new Date();
    if (new Date(appointment.date) <= now) {
      return res.status(400).json({
        success: false,
        message: "Only future appointments can be rescheduled",
      });
    }

    const dateStr    = date.split("T")[0];
    const startOfDay = new Date(`${dateStr}T00:00:00.000Z`);
    const endOfDay   = new Date(`${dateStr}T23:59:59.999Z`);

    // New date must be in the future
    if (startOfDay <= now) {
      return res.status(400).json({
        success: false,
        message: "Reschedule date must be in the future",
      });
    }

    // Check new slot is not already booked — exclude current appointment and CANCELLED
    const conflict = await prisma.appointment.findFirst({
      where: {
        doctorId: appointment.doctorId,
        date:     { gte: startOfDay, lte: endOfDay },
        time,
        status:   { notIn: ["CANCELLED"] },
        NOT:      { id: appointmentId },
      },
    });

    if (conflict) {
      return res.status(409).json({
        success: false,
        message: "This time slot is already booked",
      });
    }

    // Update appointment
    const updated = await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        date:           startOfDay,
        time,
        status:         "PENDING",
        rejectionReason: null,
      },
    });

    return res.status(200).json({
      success:     true,
      message:     "Appointment rescheduled successfully. Awaiting doctor confirmation.",
      appointment: updated,
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};
// PATCH /api/appointments/:id/cancel
export const cancelAppointment = async (req, res) => {
  const { id } = req.params;

  const appointmentId = Number(id);
  if (!Number.isInteger(appointmentId) || appointmentId <= 0) {
    return res.status(400).json({ success: false, message: "Invalid appointment ID" });
  }

  try {
    const appointment = await prisma.appointment.findFirst({
      where: { id: appointmentId, patientId: req.user.id },
    });

    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    if (!["PENDING", "CONFIRMED"].includes(appointment.status)) {
      return res.status(400).json({
        success: false,
        message: "Only pending or confirmed appointments can be cancelled",
      });
    }

    const updated = await prisma.appointment.update({
      where: { id: appointmentId },
      data:  { status: "CANCELLED" },
    });

    return res.status(200).json({
      success:     true,
      message:     "Appointment cancelled successfully",
      appointment: updated,
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};