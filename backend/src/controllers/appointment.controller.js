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

    const blockedSlot = await prisma.blockedSlot.findFirst({
      where: {
        doctorId: parseInt(doctorId),
        date:     { gte: startOfDay, lte: endOfDay },
      },
    });

    if (blockedSlot) {
      const blockedStart = parseInt(blockedSlot.startTime.split(":")[0]);
      const blockedEnd   = parseInt(blockedSlot.endTime.split(":")[0]);
      const timeHour     = parseInt(time.split(":")[0]);
      const isPM         = time.includes("PM");
      const hour24       = isPM && timeHour !== 12 ? timeHour + 12 : (!isPM && timeHour === 12 ? 0 : timeHour);

      if (hour24 >= blockedStart && hour24 < blockedEnd) {
        return res.status(409).json({
          success: false,
          message: "This time slot is not available",
        });
      }
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
            firstName:       true,
            lastName:        true,
            specialisation:  true,
            profilePhoto:    true,
            consultationFee: true,
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
      consultationFee: appt.doctor.consultationFee || 0,
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

    const blocked = await prisma.blockedSlot.findMany({
      where: {
        doctorId: doctorIdNum,
        date:     { gte: startOfDay, lte: endOfDay },
      },
      select: { startTime: true, endTime: true },
    });

    const blockedTimes = [];
    blocked.forEach((b) => {
      const startHour = parseInt(b.startTime.split(":")[0]);
      const endHour   = parseInt(b.endTime.split(":")[0]);
      for (let h = startHour; h < endHour; h++) {
        const hour = h % 12 || 12;
        const ampm = h >= 12 ? "PM" : "AM";
        blockedTimes.push(`${String(hour).padStart(2, "0")}:00 ${ampm}`);
      }
    });

    const bookedSlots = [
      ...appointments.map((a) => a.time),
      ...blockedTimes,
    ];

    return res.status(200).json({ success: true, bookedSlots });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// PATCH /api/appointments/:id/reschedule
export const rescheduleAppointment = async (req, res) => {
  const { id }         = req.params;
  const { date, time } = req.body;

  const appointmentId = Number(id);
  if (!Number.isInteger(appointmentId) || appointmentId <= 0) {
    return res.status(400).json({ success: false, message: "Invalid appointment ID" });
  }

  if (!date || !time) {
    return res.status(400).json({ success: false, message: "Date and time are required" });
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
        message: "Only pending or confirmed appointments can be rescheduled",
      });
    }

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

    if (startOfDay <= now) {
      return res.status(400).json({
        success: false,
        message: "Reschedule date must be in the future",
      });
    }

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

    const blockedSlot = await prisma.blockedSlot.findFirst({
      where: {
        doctorId: appointment.doctorId,
        date:     { gte: startOfDay, lte: endOfDay },
      },
    });

    if (blockedSlot) {
      const blockedStart = parseInt(blockedSlot.startTime.split(":")[0]);
      const blockedEnd   = parseInt(blockedSlot.endTime.split(":")[0]);
      const timeHour     = parseInt(time.split(":")[0]);
      const isPM         = time.includes("PM");
      const hour24       = isPM && timeHour !== 12 ? timeHour + 12 : (!isPM && timeHour === 12 ? 0 : timeHour);

      if (hour24 >= blockedStart && hour24 < blockedEnd) {
        return res.status(409).json({
          success: false,
          message: "This time slot is not available",
        });
      }
    }

    const updated = await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        date:            startOfDay,
        time,
        status:          "PENDING",
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
// GET /api/appointments/outstanding
export const getOutstandingBalance = async (req, res) => {
  const patientId = req.user.id;

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get all confirmed/completed appointments that are not paid
    const unpaidAppointments = await prisma.appointment.findMany({
      where: {
        patientId,
        status: { in: ["CONFIRMED", "COMPLETED", "MISSED"] },
        payment: null,
      },
      include: {
        doctor: {
          select: {
            firstName:       true,
            lastName:        true,
            specialisation:  true,
            consultationFee: true,
          },
        },
      },
      orderBy: { date: "asc" },
    });

    const SERVICE_FEE = 500;

    const formatted = unpaidAppointments.map((appt) => ({
      id:              appt.id,
      doctorName:      `Dr. ${appt.doctor.firstName} ${appt.doctor.lastName}`,
      specialisation:  appt.doctor.specialisation,
      consultationFee: appt.doctor.consultationFee || 0,
      totalAmount:     (appt.doctor.consultationFee || 0) + SERVICE_FEE,
      date:            appt.date,
      time:            appt.time,
      status:          appt.status,
      daysUntilDue:    Math.max(0, 7 - Math.floor((today - new Date(appt.date)) / (1000 * 60 * 60 * 24))),
    }));

    const totalOutstanding = formatted.reduce((sum, appt) => sum + appt.totalAmount, 0);

    return res.status(200).json({
      success:      true,
      totalOutstanding,
      unpaidAppointments: formatted,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};