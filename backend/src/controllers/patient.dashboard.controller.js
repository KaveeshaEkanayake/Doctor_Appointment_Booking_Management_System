import prisma from "../lib/prisma.js";

// GET /api/patient/dashboard
export const getPatientDashboardStats = async (req, res) => {
  const patientId = req.user.id;

  try {
    const todayStr = new Date().toISOString().split("T")[0];
    const startOfDay = new Date(`${todayStr}T00:00:00.000Z`);
    const endOfDay = new Date(`${todayStr}T23:59:59.999Z`);

    // Upcoming appointments count (PENDING + CONFIRMED)
    const upcomingCount = await prisma.appointment.count({
      where: {
        patientId,
        status: { in: ["PENDING", "CONFIRMED"] }
      }
    });

    // Completed appointments count
    const completedCount = await prisma.appointment.count({
      where: {
        patientId,
        status: "COMPLETED"
      }
    });

    // Cancelled appointments count
    const cancelledCount = await prisma.appointment.count({
      where: {
        patientId,
        status: "CANCELLED"
      }
    });

    // Next upcoming appointment
    const nextAppointment = await prisma.appointment.findFirst({
      where: {
        patientId,
        status: { in: ["PENDING", "CONFIRMED"] },
        date: { gte: startOfDay }
      },
      include: {
        doctor: {
          select: {
            firstName: true,
            lastName: true,
            specialisation: true,
            profilePhoto: true
          }
        }
      },
      orderBy: { date: "asc" }
    });

    // Recent appointments (last 3)
    const recentAppointments = await prisma.appointment.findMany({
      where: { patientId },
      include: {
        doctor: {
          select: {
            firstName: true,
            lastName: true,
            specialisation: true,
            profilePhoto: true
          }
        }
      },
      orderBy: { date: "desc" },
      take: 3
    });

    const formatStatus = (status) => {
      const map = {
        PENDING: "Pending",
        CONFIRMED: "Confirmed",
        COMPLETED: "Completed",
        CANCELLED: "Cancelled",
        MISSED: "Missed"
      };
      return map[status] || status;
    };

    return res.status(200).json({
      success: true,
      data: {
        stats: {
          upcoming: upcomingCount,
          completed: completedCount,
          cancelled: cancelledCount
        },
        nextAppointment: nextAppointment ? {
          id: nextAppointment.id,
          doctorName: `Dr. ${nextAppointment.doctor.firstName} ${nextAppointment.doctor.lastName}`,
          specialisation: nextAppointment.doctor.specialisation,
          profilePhoto: nextAppointment.doctor.profilePhoto,
          date: nextAppointment.date,
          time: nextAppointment.time,
          status: formatStatus(nextAppointment.status)
        } : null,
        recentAppointments: recentAppointments.map(apt => ({
          id: apt.id,
          doctorName: `Dr. ${apt.doctor.firstName} ${apt.doctor.lastName}`,
          specialisation: apt.doctor.specialisation,
          date: apt.date,
          time: apt.time,
          status: formatStatus(apt.status)
        }))
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