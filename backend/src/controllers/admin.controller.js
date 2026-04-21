import prisma from "../lib/prisma.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

// POST /api/admin/login
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

// GET /api/admin/doctors?status=PENDING
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

// GET /api/admin/doctors/counts
export const getDoctorCounts = async (req, res) => {
  try {
    const [pending, approved, rejected, pendingProfiles] = await Promise.all([
      prisma.doctor.count({ where: { status: "PENDING" } }),
      prisma.doctor.count({ where: { status: "APPROVED" } }),
      prisma.doctor.count({ where: { status: "REJECTED" } }),
      prisma.doctor.count({ where: { status: "APPROVED", profileStatus: "PENDING_REVIEW" } }),
    ]);

    res.status(200).json({
      success: true,
      counts: { pending, approved, rejected, pendingProfiles },
    });
  } catch {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// PATCH /api/admin/doctors/:id/status
export const updateDoctorStatus = async (req, res) => {
  const { id }     = req.params;
  const { status } = req.body;

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
    if (err.code === "P2025") {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET /api/admin/profiles?profileStatus=PENDING_REVIEW
export const getDoctorProfiles = async (req, res) => {
  const { profileStatus = "PENDING_REVIEW" } = req.query;

  const validStatuses = ["PENDING_REVIEW", "APPROVED", "REJECTED"];
  if (!validStatuses.includes(profileStatus)) {
    return res.status(400).json({ success: false, message: "Invalid profileStatus filter" });
  }

  try {
    const doctors = await prisma.doctor.findMany({
      where: {
        status:        "APPROVED",
        profileStatus: profileStatus,
      },
      select: {
        id:              true,
        firstName:       true,
        lastName:        true,
        email:           true,
        phone:           true,
        specialisation:  true,
        experience:      true,
        profileStatus:   true,
        profilePhoto:    true,
        bio:             true,
        qualifications:  true,
        consultationFee: true,
        createdAt:       true,
        updatedAt:       true,
      },
      orderBy: { updatedAt: "desc" },
    });

    res.status(200).json({ success: true, doctors });
  } catch {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// PATCH /api/admin/doctors/:id/profileStatus
export const updateDoctorProfileStatus = async (req, res) => {
  const { id }            = req.params;
  const { profileStatus } = req.body;

  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({ success: false, message: "Invalid doctor ID" });
  }

  if (!["APPROVED", "REJECTED"].includes(profileStatus)) {
    return res.status(400).json({ success: false, message: "Invalid profileStatus value" });
  }

  try {
    const doctor = await prisma.doctor.update({
      where:  { id: parseInt(id) },
      data:   { profileStatus },
      select: { id: true, firstName: true, lastName: true, profileStatus: true },
    });

    res.status(200).json({ success: true, doctor });
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET /api/admin/patients
export const getPatients = async (req, res) => {
  const { search = "" } = req.query;

  try {
    const patients = await prisma.patient.findMany({
      where: search ? {
        OR: [
          { firstName: { contains: search, mode: "insensitive" } },
          { lastName:  { contains: search, mode: "insensitive" } },
          { email:     { contains: search, mode: "insensitive" } },
        ],
      } : undefined,
      select: {
        id:        true,
        firstName: true,
        lastName:  true,
        email:     true,
        phone:     true,
        status:    true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const formatted = patients.map((p) => ({
      id:     p.id,
      name:   `${p.firstName} ${p.lastName}`,
      email:  p.email,
      phone:  p.phone,
      status: p.status,
      joined: p.createdAt,
    }));

    return res.status(200).json({ success: true, patients: formatted });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// PATCH /api/admin/patients/:id/suspend
export const togglePatientStatus = async (req, res) => {
  const { id } = req.params;

  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({ success: false, message: "Invalid patient ID" });
  }

  try {
    const patient = await prisma.patient.findUnique({
      where: { id: parseInt(id) },
    });

    if (!patient) {
      return res.status(404).json({ success: false, message: "Patient not found" });
    }

    const newStatus = patient.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";

    await prisma.patient.update({
      where: { id: parseInt(id) },
      data:  { status: newStatus },
    });

    await prisma.adminLog.create({
      data: {
        adminId: req.user.id,
        action:  `${patient.firstName} ${patient.lastName} was ${newStatus === "SUSPENDED" ? "Suspended" : "Activated"}`,
        target:  `Patient #${id}`,
      },
    });

    return res.status(200).json({
      success: true,
      message: `Patient ${newStatus === "SUSPENDED" ? "suspended" : "activated"} successfully`,
      status:  newStatus,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// DELETE /api/admin/patients/:id
export const deletePatient = async (req, res) => {
  const { id } = req.params;

  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({ success: false, message: "Invalid patient ID" });
  }

  try {
    const patient = await prisma.patient.findUnique({
      where: { id: parseInt(id) },
    });

    if (!patient) {
      return res.status(404).json({ success: false, message: "Patient not found" });
    }

    await prisma.adminLog.create({
      data: {
        adminId: req.user.id,
        action:  `${patient.firstName} ${patient.lastName} account was permanently deleted`,
        target:  `Patient #${id}`,
      },
    });

    await prisma.$transaction([
      prisma.payment.deleteMany({     where: { patientId: parseInt(id) } }),
      prisma.appointment.deleteMany({ where: { patientId: parseInt(id) } }),
      prisma.patient.delete({         where: { id: parseInt(id) } }),
    ]);

    return res.status(200).json({
      success: true,
      message: "Patient deleted successfully",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET /api/admin/patients/logs
export const getAdminLogs = async (req, res) => {
  try {
    const logs = await prisma.adminLog.findMany({
      orderBy: { createdAt: "desc" },
      take:    50,
      include: {
        admin: {
          select: { firstName: true, lastName: true },
        },
      },
    });

    const formatted = logs.map((log) => ({
      id:        log.id,
      action:    log.action,
      target:    log.target,
      adminName: `${log.admin.firstName} ${log.admin.lastName}`,
      createdAt: log.createdAt,
    }));

    return res.status(200).json({ success: true, logs: formatted });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
// PATCH /api/admin/doctors/:id/suspend
export const toggleDoctorStatus = async (req, res) => {
  const { id } = req.params;

  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({ success: false, message: "Invalid doctor ID" });
  }

  try {
    const doctor = await prisma.doctor.findUnique({
      where: { id: parseInt(id) },
    });

    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    const newStatus = doctor.status === "APPROVED" ? "SUSPENDED" : "APPROVED";

    const updated = await prisma.doctor.update({
      where: { id: parseInt(id) },
      data:  { status: newStatus },
    });

    await prisma.adminLog.create({
      data: {
        adminId: req.user.id,
        action:  `Dr. ${doctor.firstName} ${doctor.lastName} was ${newStatus === "SUSPENDED" ? "Suspended" : "Activated"}`,
        target:  `Doctor #${id}`,
      },
    });

    return res.status(200).json({
      success: true,
      message: `Doctor ${newStatus === "SUSPENDED" ? "suspended" : "activated"} successfully`,
      status:  newStatus,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// DELETE /api/admin/doctors/:id
export const deleteDoctor = async (req, res) => {
  const { id } = req.params;

  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({ success: false, message: "Invalid doctor ID" });
  }

  try {
    const doctor = await prisma.doctor.findUnique({
      where: { id: parseInt(id) },
    });

    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    await prisma.adminLog.create({
      data: {
        adminId: req.user.id,
        action:  `Dr. ${doctor.firstName} ${doctor.lastName} account was permanently deleted`,
        target:  `Doctor #${id}`,
      },
    });

    await prisma.$transaction([
      prisma.appointment.deleteMany({ where: { doctorId: parseInt(id) } }),
      prisma.availability.deleteMany({ where: { doctorId: parseInt(id) } }),
      prisma.blockedSlot.deleteMany({  where: { doctorId: parseInt(id) } }),
      prisma.doctor.delete({           where: { id: parseInt(id) } }),
    ]);

    return res.status(200).json({
      success: true,
      message: "Doctor deleted successfully",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};