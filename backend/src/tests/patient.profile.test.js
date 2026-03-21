import { describe, it, expect, afterAll, beforeAll, beforeEach } from "@jest/globals";
import request from "supertest";
import app     from "../app.js";
import prisma  from "../lib/prisma.js";
import bcrypt  from "bcryptjs";
import jwt     from "jsonwebtoken";

let token;
let patientId;

beforeAll(async () => {
  const hashed = await bcrypt.hash("Test@1234", 10);
  const patient = await prisma.patient.create({
    data: {
      firstName: "Test",
      lastName:  "Patient",
      email:     "testpatient@profile.com",
      password:  hashed,
      phone:     "0771234567",
    },
  });
  patientId = patient.id;
  token = jwt.sign(
    { id: patient.id, email: patient.email, role: "patient" },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
});

afterAll(async () => {
  await prisma.patient.deleteMany({
    where: { email: "testpatient@profile.com" }
  });
});

beforeEach(async () => {
  await prisma.patient.update({
    where: { id: patientId },
    data: {
      firstName:   "Test",
      lastName:    "Patient",
      phone:       "0771234567",
      address:     null,
      dateOfBirth: null,
    },
  });
});

describe("GET /api/patient/profile", () => {

  it("should return patient profile when authenticated", async () => {
    const res = await request(app)
      .get("/api/patient/profile")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.patient).toBeDefined();
    expect(res.body.patient.email).toBe("testpatient@profile.com");
    expect(res.body.patient.firstName).toBe("Test");
  });

  it("should not return password in response", async () => {
    const res = await request(app)
      .get("/api/patient/profile")
      .set("Authorization", `Bearer ${token}`);

    expect(res.body.patient.password).toBeUndefined();
  });

  it("should return 401 when no token provided", async () => {
    const res = await request(app)
      .get("/api/patient/profile");

    expect(res.status).toBe(401);
  });

  it("should return 403 when doctor token is used", async () => {
    const doctorToken = jwt.sign(
      { id: 999, email: "doctor@test.com", role: "doctor" },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    const res = await request(app)
      .get("/api/patient/profile")
      .set("Authorization", `Bearer ${doctorToken}`);

    expect(res.status).toBe(403);
  });

  it("should return patient id, firstName, lastName, email, phone", async () => {
    const res = await request(app)
      .get("/api/patient/profile")
      .set("Authorization", `Bearer ${token}`);

    expect(res.body.patient.id).toBeDefined();
    expect(res.body.patient.firstName).toBeDefined();
    expect(res.body.patient.lastName).toBeDefined();
    expect(res.body.patient.email).toBeDefined();
    expect(res.body.patient.phone).toBeDefined();
  });

});

describe("PUT /api/patient/profile", () => {

  it("should update patient phone number", async () => {
    const res = await request(app)
      .put("/api/patient/profile")
      .set("Authorization", `Bearer ${token}`)
      .send({ phone: "0779999999" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.patient.phone).toBe("0779999999");
  });

  it("should update patient address", async () => {
    const res = await request(app)
      .put("/api/patient/profile")
      .set("Authorization", `Bearer ${token}`)
      .send({ address: "123 Main St, Colombo" });

    expect(res.status).toBe(200);
    expect(res.body.patient.address).toBe("123 Main St, Colombo");
  });

  it("should update patient dateOfBirth", async () => {
    const res = await request(app)
      .put("/api/patient/profile")
      .set("Authorization", `Bearer ${token}`)
      .send({ dateOfBirth: "2000-01-15" });

    expect(res.status).toBe(200);
    expect(res.body.patient.dateOfBirth).toBeDefined();
  });

  it("should update firstName and lastName", async () => {
    const res = await request(app)
      .put("/api/patient/profile")
      .set("Authorization", `Bearer ${token}`)
      .send({ firstName: "Updated", lastName: "Name" });

    expect(res.status).toBe(200);
    expect(res.body.patient.firstName).toBe("Updated");
    expect(res.body.patient.lastName).toBe("Name");
  });

  it("should show success message after update", async () => {
    const res = await request(app)
      .put("/api/patient/profile")
      .set("Authorization", `Bearer ${token}`)
      .send({ phone: "0771111111" });

    expect(res.body.message).toBe("Profile updated successfully");
  });

  it("should not allow email to be updated", async () => {
    const res = await request(app)
      .put("/api/patient/profile")
      .set("Authorization", `Bearer ${token}`)
      .send({ email: "newemail@test.com" });

    expect(res.status).toBe(200);

    // Verify email unchanged in DB
    const patient = await prisma.patient.findUnique({
      where: { id: patientId }
    });
    expect(patient.email).toBe("testpatient@profile.com");
  });

  it("should return 401 when no token provided", async () => {
    const res = await request(app)
      .put("/api/patient/profile")
      .send({ phone: "0771111111" });

    expect(res.status).toBe(401);
  });

  it("should return 403 when doctor token used", async () => {
    const doctorToken = jwt.sign(
      { id: 999, email: "doctor@test.com", role: "doctor" },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    const res = await request(app)
      .put("/api/patient/profile")
      .set("Authorization", `Bearer ${doctorToken}`)
      .send({ phone: "0771111111" });

    expect(res.status).toBe(403);
  });

  it("should reject invalid dateOfBirth format", async () => {
    const res = await request(app)
      .put("/api/patient/profile")
      .set("Authorization", `Bearer ${token}`)
      .send({ dateOfBirth: "not-a-date" });

    expect(res.status).toBe(400);
  });

  it("should reject empty firstName", async () => {
    const res = await request(app)
      .put("/api/patient/profile")
      .set("Authorization", `Bearer ${token}`)
      .send({ firstName: "" });

    expect(res.status).toBe(400);
  });

});