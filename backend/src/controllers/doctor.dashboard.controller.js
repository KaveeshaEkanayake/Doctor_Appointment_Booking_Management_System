import prisma from "../lib/prisma.js";

// GET /api/doctor/dashboard
export const getDashboardStats = async (req, res) => {
  const doctorId = req.user.id;

  try {
    const todayStr = new Date().toISOString().split("T")[0];
    const startOfDay = new Date(`${todayStr}T00:00:00.000Z`);
    const endOfDay = new Date(`${todayStr}T23:59:59.999Z`);

    // Today's appointments count
    const todayCount = await prisma.appointment.count({
      where: {
        doctorId,
        date: {
          gte: startOfDay,
          lte: endOfDay
        },
        status: { not: "CANCELLED" }
      }
    });

    // Total patients served (COMPLETED)
    const totalPatients = await prisma.appointment.count({
      where: {
        doctorId,
        status: "COMPLETED"
      }
    });

    // Pending requests
    const pendingCount = await prisma.appointment.count({
      where: {
        doctorId,
        status: "PENDING"
      }
    });

    // Today's schedule
    const todayAppointments = await prisma.appointment.findMany({
      where: {
        doctorId,
        date: {
          gte: startOfDay,
          lte: endOfDay
        },
        status: { not: "CANCELLED" }
      },
      include: {
        patient: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: { time: "asc" }
    });

    const schedule = todayAppointments.map(apt => ({
      id: apt.id,
      name: `${apt.patient.firstName} ${apt.patient.lastName}`,
      time: formatTime(apt.time),
      reason: apt.reason,
      status: formatStatus(apt.status),
    }));

    return res.status(200).json({
      success: true,
      data: {
        stats: {
          today: todayCount,
          patients: totalPatients,
          pending: pendingCount
        },
        schedule
      }
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

function formatTime(time) {
  if (!time) return "";
  const [hours, minutes] = time.split(":");
  const h = parseInt(hours);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
}

function formatStatus(status) {
  const map = {
    PENDING: "Pending",
    CONFIRMED: "Confirmed",
    COMPLETED: "Completed",
    CANCELLED: "Cancelled",
    MISSED: "Missed"
  };
  return map[status] || status;
}