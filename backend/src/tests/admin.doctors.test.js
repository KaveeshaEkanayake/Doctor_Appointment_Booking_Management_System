import request from "supertest";
import app     from "../app.js";
import prisma  from "../lib/prisma.js";
import bcrypt from "bcryptjs"; 
import jwt     from "jsonwebtoken";

describe("Admin Doctor Management", () => {
  let adminToken;
  let testDoctorId;

  beforeAll(async () => {
    const hashed = await bcrypt.hash("Admin@1234", 10);
    const admin  = await prisma.admin.upsert({
      where:  { email: "testadmin_docs@dams.com" },
      update: { password: hashed },
      create: {
        email: "testadmin_docs@dams.com",
        password: hashed,
        firstName: "Test",
        lastName:  "Admin",
      },
    });

    adminToken = jwt.sign(
      { id: admin.id, email: admin.email, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    const doc = await prisma.doctor.create({
      data: {
        email:          "pending.doc.test@dams.com",
        password:       await bcrypt.hash("Pass@1234", 10),
        firstName:      "Pending",
        lastName:       "Doctor",
        phone:          "0700000000",
        specialisation: "Cardiology",
        status:         "PENDING",
      },
    });
    testDoctorId = doc.id;
  });

  afterAll(async () => {
    await prisma.doctor.deleteMany({ where: { email: "pending.doc.test@dams.com" } });
    await prisma.admin.deleteMany({ where: { email: "testadmin_docs@dams.com" } });
    await prisma.$disconnect();
  });

  it("✅ GET /api/admin/doctors returns PENDING doctors", async () => {
    const res = await request(app)
      .get("/api/admin/doctors")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.doctors)).toBe(true);
    expect(res.body.doctors.find((d) => d.id === testDoctorId)).toBeDefined();
  });

  it("✅ PATCH approves a doctor", async () => {
    const res = await request(app)
      .patch(`/api/admin/doctors/${testDoctorId}/status`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ status: "APPROVED" });

    expect(res.status).toBe(200);
    expect(res.body.doctor.status).toBe("APPROVED");
  });

  it("✅ PATCH rejects a doctor", async () => {
    const res = await request(app)
      .patch(`/api/admin/doctors/${testDoctorId}/status`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ status: "REJECTED" });

    expect(res.status).toBe(200);
    expect(res.body.doctor.status).toBe("REJECTED");
  });

  it("❌ PATCH returns 400 for invalid status", async () => {
    const res = await request(app)
      .patch(`/api/admin/doctors/${testDoctorId}/status`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ status: "BANANA" });

    expect(res.status).toBe(400);
  });

  it("❌ GET returns 401 without token", async () => {
    const res = await request(app).get("/api/admin/doctors");
    expect(res.status).toBe(401);
  });

  it("❌ GET returns 403 with non-admin token", async () => {
    const doctorToken = jwt.sign(
      { id: 999, email: "fake@doctor.com", role: "doctor" },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
    const res = await request(app)
      .get("/api/admin/doctors")
      .set("Authorization", `Bearer ${doctorToken}`);

    expect(res.status).toBe(403);
  });
});