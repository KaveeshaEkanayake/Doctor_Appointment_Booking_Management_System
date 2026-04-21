import prisma from "../lib/prisma.js";

// POST /api/payments
export const makePayment = async (req, res) => {
  const patientId = req.user.id;
  const { appointmentId, cardName, cardNumber, expiry, cvv } = req.body;

  if (!appointmentId || !cardName || !cardNumber || !expiry || !cvv) {
    return res.status(400).json({
      success: false,
      message: "All payment details are required",
    });
  }

  const cleanCard = cardNumber.replace(/\s/g, "");
  if (!/^\d{16}$/.test(cleanCard)) {
    return res.status(400).json({
      success: false,
      message: "Invalid card number format. Must be 16 digits.",
    });
  }

  if (!/^\d{2}\/\d{2}$/.test(expiry)) {
    return res.status(400).json({
      success: false,
      message: "Invalid expiry format. Use MM/YY.",
    });
  }

  if (!/^\d{3,4}$/.test(cvv)) {
    return res.status(400).json({
      success: false,
      message: "Invalid CVV format.",
    });
  }

  try {
    const appointment = await prisma.appointment.findFirst({
      where: { id: parseInt(appointmentId), patientId },
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
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    if (appointment.status !== "CONFIRMED") {
      return res.status(400).json({
        success: false,
        message: "Only confirmed appointments can be paid",
      });
    }

    const existingPayment = await prisma.payment.findUnique({
      where: { appointmentId: parseInt(appointmentId) },
    });

    if (existingPayment) {
      return res.status(409).json({
        success: false,
        message: "Payment already made for this appointment",
      });
    }

    const amount = appointment.doctor.consultationFee || 0;

    const [payment] = await prisma.$transaction([
      prisma.payment.create({
        data: {
          appointmentId: parseInt(appointmentId),
          patientId,
          amount,
          cardName:  cardName.trim(),
          cardLast4: cleanCard.slice(-4),
          status:    "SUCCESS",
        },
      }),
      prisma.appointment.update({
        where: { id: parseInt(appointmentId) },
        data:  { status: "PAID" },
      }),
    ]);

    return res.status(201).json({
      success: true,
      message: "Payment successful",
      payment: {
        id:            payment.id,
        appointmentId: payment.appointmentId,
        amount:        payment.amount,
        cardLast4:     payment.cardLast4,
        status:        payment.status,
        paidAt:        payment.paidAt,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// GET /api/payments/appointment/:appointmentId
export const getPaymentByAppointment = async (req, res) => {
  const patientId     = req.user.id;
  const appointmentId = parseInt(req.params.appointmentId);

  if (!Number.isInteger(appointmentId) || appointmentId <= 0) {
    return res.status(400).json({ success: false, message: "Invalid appointment ID" });
  }

  try {
    const payment = await prisma.payment.findFirst({
      where: { appointmentId, patientId },
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    return res.status(200).json({ success: true, payment });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// GET /api/payments/my
export const getMyPayments = async (req, res) => {
  const patientId = req.user.id;

  try {
    const payments = await prisma.payment.findMany({
      where: { patientId },
      include: {
        appointment: {
          include: {
            doctor: {
              select: {
                firstName:      true,
                lastName:       true,
                specialisation: true,
              },
            },
          },
        },
      },
      orderBy: { paidAt: "desc" },
    });

    const formatted = payments.map((p) => ({
      id:             p.id,
      appointmentId:  p.appointmentId,
      doctorName:     `Dr. ${p.appointment.doctor.firstName} ${p.appointment.doctor.lastName}`,
      specialisation: p.appointment.doctor.specialisation,
      date:           p.appointment.date,
      time:           p.appointment.time,
      amount:         p.amount,
      cardLast4:      p.cardLast4,
      cardName:       p.cardName,
      status:         p.status,
      paidAt:         p.paidAt,
    }));

    return res.status(200).json({ success: true, payments: formatted });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};
// DELETE /api/payments/:id/refund
export const refundPayment = async (req, res) => {
  const patientId = req.user.id;
  const paymentId = parseInt(req.params.id);

  if (!Number.isInteger(paymentId) || paymentId <= 0) {
    return res.status(400).json({ success: false, message: "Invalid payment ID" });
  }

  try {
    const payment = await prisma.payment.findFirst({
      where: { id: paymentId, patientId },
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    // Refund and cancel appointment in transaction
    await prisma.$transaction([
      prisma.payment.delete({ where: { id: paymentId } }),
      prisma.appointment.update({
        where: { id: payment.appointmentId },
        data:  { status: "CANCELLED" },
      }),
    ]);

    return res.status(200).json({
      success: true,
      message: "Payment refunded and appointment cancelled successfully",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};