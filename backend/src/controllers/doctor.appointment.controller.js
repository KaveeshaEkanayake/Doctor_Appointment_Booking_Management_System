import prisma from "../lib/prisma.js";

// GET /api/doctor/appointments
export const getDoctorAppointments = async (req, res) => {
  try {
    const appointments = await prisma.appointment.findMany({
      where: { doctorId: req.user.id },
      include: {
        patient: {
          select: {
            id:        true,
            firstName: true,
            lastName:  true,
            phone:     true,
          },
        },
      },
      orderBy: { date: "asc" },
    });

    const formatted = appointments.map((appt) => ({
      id:              appt.id,
      patientName:     `${appt.patient.firstName} ${appt.patient.lastName}`,
      patientPhone:    appt.patient.phone,
      date:            appt.date,
      time:            appt.time,
      reason:          appt.reason,
      notes:           appt.notes || null,
      status:          appt.status,
      rejectionReason: appt.rejectionReason,
    }));

    return res.status(200).json({ success: true, appointments: formatted });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// PATCH /api/doctor/appointments/:id/status
export const updateAppointmentStatus = async (req, res) => {
  const { id }                      = req.params;
  const { status, rejectionReason } = req.body;

  const parsedId = Number(id);
  if (!Number.isInteger(parsedId) || parsedId <= 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid appointment ID",
    });
  }

  if (!["CONFIRMED", "CANCELLED"].includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Status must be CONFIRMED or CANCELLED",
    });
  }

  if (status === "CANCELLED" && !rejectionReason?.trim()) {
    return res.status(400).json({
      success: false,
      message: "Rejection reason is required when cancelling",
    });
  }

  try {
    const appointment = await prisma.appointment.findFirst({
      where: { id: parsedId, doctorId: req.user.id },
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    if (appointment.status !== "PENDING") {
      return res.status(400).json({
        success: false,
        message: "Only pending appointments can be updated",
      });
    }

    const updated = await prisma.appointment.update({
      where: { id: parsedId },
      data: {
        status,
        rejectionReason: status === "CANCELLED" ? rejectionReason : null,
      },
    });

    return res.status(200).json({
      success:     true,
      message:     `Appointment ${status === "CONFIRMED" ? "confirmed" : "rejected"} successfully`,
      appointment: updated,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// PATCH /api/doctor/appointments/:id/notes
export const addAppointmentNotes = async (req, res) => {
  const { id }    = req.params;
  const { notes } = req.body;
  const doctorId  = req.user.id;

  const parsedId = Number(id);
  if (!Number.isInteger(parsedId) || parsedId <= 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid appointment ID",
    });
  }

  if (!notes?.trim()) {
    return res.status(400).json({
      success: false,
      message: "Notes cannot be empty",
    });
  }

  try {
    const appointment = await prisma.appointment.findFirst({
      where: { id: parsedId, doctorId },
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    const updated = await prisma.appointment.update({
      where: { id: parsedId },
      data:  { notes: notes.trim() },
    });

    return res.status(200).json({
      success:     true,
      message:     "Notes saved successfully",
      appointment: updated,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// GET /api/doctor/patients/:patientId/notes
export const getPatientNotes = async (req, res) => {
  const doctorId  = req.user.id;
  const patientId = Number(req.params.patientId);

  if (!Number.isInteger(patientId) || patientId <= 0) {
    return res.status(400).json({ success: false, message: "Invalid patient ID" });
  }

  try {
    const appointments = await prisma.appointment.findMany({
      where: {
        doctorId,
        patientId,
        notes: { not: null },
      },
      orderBy: { date: "desc" },
      select: {
        id:     true,
        date:   true,
        time:   true,
        reason: true,
        notes:  true,
      },
    });

    const notes = appointments.map((apt) => ({
      id:      apt.id,
      date:    new Date(apt.date).toLocaleDateString("en-US", {
        month: "short", day: "numeric", year: "numeric"
      }),
      time:    apt.time,
      reason:  apt.reason || "—",
      summary: apt.notes,
    }));

    return res.status(200).json({ success: true, notes });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};
// PATCH /api/doctor/appointments/:id/complete
export const completeAppointment = async (req, res) => {
  const doctorId = req.user.id;
  const { id }   = req.params;

  const parsedId = Number(id);
  if (!Number.isInteger(parsedId) || parsedId <= 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid appointment ID",
    });
  }

  try {
    const appointment = await prisma.appointment.findFirst({
      where: { id: parsedId, doctorId },
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    if (!["CONFIRMED", "PAID"].includes(appointment.status)) {
      return res.status(400).json({
        success: false,
        message: "Only confirmed or paid appointments can be marked as completed",
      });
    }

    const updated = await prisma.appointment.update({
      where: { id: parsedId },
      data:  { status: "COMPLETED" },
    });

    return res.status(200).json({
      success:     true,
      message:     "Appointment marked as completed",
      appointment: updated,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};