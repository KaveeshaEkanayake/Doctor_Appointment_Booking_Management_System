import prisma from "../lib/prisma.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

export const adminLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return res.status(500).json({ success: false, message: "Internal server error" });
    }

    const admin = await prisma.admin.findUnique({ where: { email } });
    if (!admin) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const isMatch = await bcryptjs.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: "admin" },
      jwtSecret,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      success: true,
      token,
      admin: {
        id:        admin.id,
        email:     admin.email,
        firstName: admin.firstName,
        lastName:  admin.lastName,
        role:      "admin",
      },
    });
  } catch {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getDoctors = async (req, res) => {
  const { status = "PENDING" } = req.query;

  const validStatuses = ["PENDING", "APPROVED", "REJECTED"];
  if (!validStatuses.includes(status.toUpperCase())) {
    return res.status(400).json({ success: false, message: "Invalid status filter" });
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

    res.status(200).json({ success: true, doctors });
  } catch {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const updateDoctorStatus = async (req, res) => {
  const { id }     = req.params;
  const { status } = req.body;

  // Validate id is numeric
  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({ success: false, message: "Invalid doctor ID" });
  }

  if (!["APPROVED", "REJECTED"].includes(status)) {
    return res.status(400).json({ success: false, message: "Invalid status value" });
  }

  try {
    const doctor = await prisma.doctor.update({
      where:  { id: parseInt(id) },
      data:   { status },
      select: { id: true, firstName: true, lastName: true, status: true },
    });

    res.status(200).json({ success: true, doctor });
  } catch (err) {
    // Prisma throws P2025 when record not found
    if (err.code === "P2025") {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }
    res.status(500).json({ success: false, message: "Server error" });
  }
};