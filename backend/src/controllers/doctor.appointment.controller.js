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
  const { id }                         = req.params;
  const { status, rejectionReason }    = req.body;

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
      where: { id: parseInt(id), doctorId: req.user.id },
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
      where: { id: parseInt(id) },
      data: {
        status,
        rejectionReason: status === "CANCELLED" ? rejectionReason : null,
      },
    });

    return res.status(200).json({
      success: true,
      message: `Appointment ${status === "CONFIRMED" ? "confirmed" : "rejected"} successfully`,
      appointment: updated,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};