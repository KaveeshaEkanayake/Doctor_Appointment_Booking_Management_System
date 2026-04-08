import cron          from "node-cron";
import prisma        from "./prisma.js";
import { sendReminderEmail } from "./email.js";

const formatTime = (time) => time;

const formatDate = (date) => {
  return new Date(date).toLocaleDateString("en-US", {
    weekday: "long",
    year:    "numeric",
    month:   "long",
    day:     "numeric",
  });
};

const sendReminders = async () => {
  try {
    const now      = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const dayAfter = new Date(tomorrow);
    dayAfter.setHours(23, 59, 59, 999);

    console.log("Checking reminders at:", now.toISOString());
    console.log("Looking for appointments on:", tomorrow.toISOString(), "to", dayAfter.toISOString());

    const appointments = await prisma.appointment.findMany({
      where: {
        status:       { in: ["PENDING", "CONFIRMED"] },
        reminderSent: false,
        date: {
          gte: tomorrow,
          lte: dayAfter,
        },
      },
      include: {
        patient: { select: { firstName: true, lastName: true, email: true } },
        doctor:  { select: { firstName: true, lastName: true, email: true, specialisation: true } },
      },
    });

    console.log("Appointments found:", appointments.length);

    for (const appt of appointments) {
      const dateStr = formatDate(appt.date);
      const timeStr = formatTime(appt.time);

      await sendReminderEmail({
        to:      appt.patient.email,
        subject: "Appointment Reminder — MediCare",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Appointment Reminder</h2>
            <p>Dear ${appt.patient.firstName},</p>
            <p>This is a reminder that you have an upcoming appointment tomorrow.</p>
            <div style="background: #f0f4ff; border-radius: 8px; padding: 16px; margin: 16px 0;">
              <p><strong>Doctor:</strong> Dr. ${appt.doctor.firstName} ${appt.doctor.lastName}</p>
              <p><strong>Specialisation:</strong> ${appt.doctor.specialisation}</p>
              <p><strong>Date:</strong> ${dateStr}</p>
              <p><strong>Time:</strong> ${timeStr}</p>
            </div>
            <p>Please arrive 10 minutes early. If you need to cancel or reschedule, please do so as soon as possible.</p>
            <p>Thank you,<br/>MediCare Team</p>
          </div>
        `,
      });

      await sendReminderEmail({
        to:      appt.doctor.email,
        subject: "Appointment Reminder — MediCare",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Appointment Reminder</h2>
            <p>Dear Dr. ${appt.doctor.firstName},</p>
            <p>This is a reminder that you have an upcoming appointment tomorrow.</p>
            <div style="background: #f0f4ff; border-radius: 8px; padding: 16px; margin: 16px 0;">
              <p><strong>Patient:</strong> ${appt.patient.firstName} ${appt.patient.lastName}</p>
              <p><strong>Date:</strong> ${dateStr}</p>
              <p><strong>Time:</strong> ${timeStr}</p>
            </div>
            <p>Thank you,<br/>MediCare Team</p>
          </div>
        `,
      });

      await prisma.appointment.update({
        where: { id: appt.id },
        data:  { reminderSent: true },
      });

      console.log(`Reminders sent for appointment ${appt.id}`);
    }
  } catch (err) {
    console.error("Error sending reminders:", err);
  }
};

export const startReminderJob = () => {
  cron.schedule("0 * * * *", async () => {
    console.log("Running reminder job...");
    await sendReminders();
  });
  console.log("Reminder job scheduled");
};