import prisma from "../lib/prisma.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// POST /api/admin/login
export const adminLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await prisma.admin.findUnique({ where: { email } });

    if (!admin) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      token,
      admin: {
        id:        admin.id,
        email:     admin.email,
        firstName: admin.firstName,
        lastName:  admin.lastName,
        role:      "admin",
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/admin/doctors?status=PENDING
export const getDoctors = async (req, res) => {
  const { status = "PENDING" } = req.query;

  const validStatuses = ["PENDING", "APPROVED", "REJECTED"];
  if (!validStatuses.includes(status.toUpperCase())) {
    return res.status(400).json({ message: "Invalid status filter" });
  }

  try {
    const doctors = await prisma.doctor.findMany({
      where:   { status: status.toUpperCase() },
      select: {
        id:             true,
        firstName:      true,
        lastName:       true,
        email:          true,
        phone:          true,
        specialisation: true,
        experience:     true,
        status:         true,
        profilePhoto:   true,
        createdAt:      true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({ doctors });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// PATCH /api/admin/doctors/:id/status
export const updateDoctorStatus = async (req, res) => {
  const { id }     = req.params;
  const { status } = req.body;

  if (!["APPROVED", "REJECTED"].includes(status)) {
    return res.status(400).json({ message: "Invalid status value" });
  }

  try {
    const doctor = await prisma.doctor.update({
      where: { id: parseInt(id) },
      data:  { status },
      select: { id: true, firstName: true, lastName: true, status: true },
    });

    res.status(200).json({ doctor });
  } catch (error) {
    res.status(500).json({ message: "Doctor not found or update failed" });
  }
};