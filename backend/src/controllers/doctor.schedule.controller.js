import prisma from "../lib/prisma.js";

// GET /api/doctor/schedule?startDate=2026-04-14&endDate=2026-04-20
export const getWeeklySchedule = async (req, res) => {
  const doctorId = req.user.id;
  const { startDate, endDate } = req.query;

  if (!startDate || !endDate) {
    return res.status(400).json({
      success: false,
      message: "startDate and endDate are required",
    });
  }

  try {
    const start = new Date(`${startDate}T00:00:00.000Z`);
    const end   = new Date(`${endDate}T23:59:59.999Z`);

    const [appointments, blockedSlots] = await Promise.all([
      prisma.appointment.findMany({
        where: {
          doctorId,
          date:   { gte: start, lte: end },
          status: { notIn: ["CANCELLED"] },
        },
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
      }),
      prisma.blockedSlot.findMany({
        where: {
          doctorId,
          date: { gte: start, lte: end },
        },
        orderBy: { date: "asc" },
      }),
    ]);

    const formattedAppointments = appointments.map((appt) => ({
      id:              appt.id,
      patientId:       appt.patient.id,
      patientName:     `${appt.patient.firstName} ${appt.patient.lastName}`,
      patientPhone:    appt.patient.phone,
      date:            appt.date,
      time:            appt.time,
      reason:          appt.reason,
      status:          appt.status,
      notes:           appt.notes || null,
      rejectionReason: appt.rejectionReason,
    }));

    return res.status(200).json({
      success:      true,
      appointments: formattedAppointments,
      blockedSlots,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// POST /api/doctor/schedule/block
export const blockSlot = async (req, res) => {
  const doctorId = req.user.id;
  const { date, startTime, endTime, reason } = req.body;

  if (!date || !startTime || !endTime || !reason?.trim()) {
    return res.status(400).json({
      success: false,
      message: "date, startTime, endTime and reason are required",
    });
  }

  try {
    const slotDate = new Date(`${date}T00:00:00.000Z`);

    // Check for conflicting appointments
    const conflict = await prisma.appointment.findFirst({
      where: {
        doctorId,
        date:   slotDate,
        time:   { in: [startTime] },
        status: { notIn: ["CANCELLED"] },
      },
    });

    if (conflict) {
      return res.status(409).json({
        success: false,
        message: "A non-cancelled appointment already exists in this slot",
      });
    }

    // Check for existing block
    const existingBlock = await prisma.blockedSlot.findFirst({
      where: {
        doctorId,
        date:      slotDate,
        startTime,
      },
    });

    if (existingBlock) {
      return res.status(409).json({
        success: false,
        message: "This slot is already blocked",
      });
    }

    const blocked = await prisma.blockedSlot.create({
      data: {
        doctorId,
        date: slotDate,
        startTime,
        endTime,
        reason: reason.trim(),
      },
    });

    return res.status(201).json({
      success:     true,
      message:     "Slot blocked successfully",
      blockedSlot: blocked,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// DELETE /api/doctor/schedule/block/:id
export const unblockSlot = async (req, res) => {
  const doctorId = req.user.id;
  const { id }   = req.params;

  const parsedId = Number(id);
  if (!Number.isInteger(parsedId) || parsedId <= 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid block ID",
    });
  }

  try {
    const block = await prisma.blockedSlot.findFirst({
      where: { id: parsedId, doctorId },
    });

    if (!block) {
      return res.status(404).json({
        success: false,
        message: "Blocked slot not found",
      });
    }

    await prisma.blockedSlot.delete({ where: { id: parsedId } });

    return res.status(200).json({
      success: true,
      message: "Slot unblocked successfully",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};