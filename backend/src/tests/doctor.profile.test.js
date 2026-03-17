import request from "supertest";
import app from "../app.js";
import prisma from "../lib/prisma.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

let doctorToken;
let doctorId;

beforeAll(async () => {
  await prisma.doctor.deleteMany({
    where: { email: "profiletest@doctor.com" }
  });

  const hashedPassword = await bcrypt.hash("Test1234", 10);
  const doctor = await prisma.doctor.create({
    data: {
      firstName: "Test",
      lastName: "Doctor",
      email: "profiletest@doctor.com",
      password: hashedPassword,
      phone: "0771234567",
      specialisation: "Cardiology",
      status: "APPROVED"
    }
  });

  doctorId = doctor.id;
  doctorToken = jwt.sign(
    { id: doctor.id, email: doctor.email, role: "doctor" },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
});

afterAll(async () => {
  await prisma.doctor.deleteMany({
    where: { email: "profiletest@doctor.com" }
  });
  await prisma.$disconnect();
});

describe("GET /api/doctor/profile", () => {
  it("should return doctor profile when authenticated", async () => {
    const res = await request(app)
      .get("/api/doctor/profile")
      .set("Authorization", `Bearer ${doctorToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.doctor.email).toBe("profiletest@doctor.com");
    expect(res.body.doctor.firstName).toBe("Test");
    expect(res.body.doctor.specialisation).toBe("Cardiology");
  });

  it("should return 401 without token", async () => {
    const res = await request(app).get("/api/doctor/profile");

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Access denied. No token provided.");
  });

  it("should return 401 with invalid token", async () => {
    const res = await request(app)
      .get("/api/doctor/profile")
      .set("Authorization", "Bearer invalidtoken123");

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Invalid or expired token");
  });

  it("should return 403 with patient token", async () => {
    const patientToken = jwt.sign(
      { id: 999, email: "patient@test.com", role: "patient" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const res = await request(app)
      .get("/api/doctor/profile")
      .set("Authorization", `Bearer ${patientToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Access denied. Doctors only.");
  });
});

describe("PUT /api/doctor/profile", () => {
  it("should update profile successfully", async () => {
    const res = await request(app)
      .put("/api/doctor/profile")
      .set("Authorization", `Bearer ${doctorToken}`)
      .send({
        bio: "Experienced cardiologist with 10 years of practice",
        qualifications: "MBBS, MD Cardiology",
        experience: "10 years",
        consultationFee: 2500,
        specialisation: "Cardiology"
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Profile updated successfully");
    expect(res.body.doctor.bio).toBe("Experienced cardiologist with 10 years of practice");
    expect(res.body.doctor.qualifications).toBe("MBBS, MD Cardiology");
    expect(res.body.doctor.consultationFee).toBe(2500);
  });

  it("should update profile photo with valid URL", async () => {
    const res = await request(app)
      .put("/api/doctor/profile")
      .set("Authorization", `Bearer ${doctorToken}`)
      .send({
        profilePhoto: "https://res.cloudinary.com/demo/image/upload/doctor.jpg"
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.doctor.profilePhoto).toBe(
      "https://res.cloudinary.com/demo/image/upload/doctor.jpg"
    );
  });

  it("should reject invalid profile photo URL", async () => {
    const res = await request(app)
      .put("/api/doctor/profile")
      .set("Authorization", `Bearer ${doctorToken}`)
      .send({
        profilePhoto: "not-a-valid-url"
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("should reject negative consultation fee", async () => {
    const res = await request(app)
      .put("/api/doctor/profile")
      .set("Authorization", `Bearer ${doctorToken}`)
      .send({
        consultationFee: -500
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("should allow partial profile update", async () => {
    const res = await request(app)
      .put("/api/doctor/profile")
      .set("Authorization", `Bearer ${doctorToken}`)
      .send({
        bio: "Updated bio only"
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.doctor.bio).toBe("Updated bio only");
    expect(res.body.doctor.qualifications).toBe("MBBS, MD Cardiology");
  });

  it("should return 401 without token", async () => {
    const res = await request(app)
      .put("/api/doctor/profile")
      .send({ bio: "Test" });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

describe("GET /api/doctors (public)", () => {
  it("should return only approved doctors", async () => {
    const res = await request(app).get("/api/doctors");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.doctors)).toBe(true);

    const foundDoctor = res.body.doctors.find(
      (d) => d.firstName === "Test" && d.lastName === "Doctor"
    );
    expect(foundDoctor).toBeDefined();
  });

  it("should not expose sensitive fields", async () => {
    const res = await request(app).get("/api/doctors");

    expect(res.status).toBe(200);
    res.body.doctors.forEach((doctor) => {
      expect(doctor.password).toBeUndefined();
      expect(doctor.email).toBeUndefined();
      expect(doctor.phone).toBeUndefined();
    });
  });
});

describe("GET /api/doctors/:id (public)", () => {
  it("should return a single doctor profile", async () => {
    const res = await request(app).get(`/api/doctors/${doctorId}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.doctor.firstName).toBe("Test");
    expect(res.body.doctor.specialisation).toBe("Cardiology");
  });

  it("should return 404 for non-existent doctor", async () => {
    const res = await request(app).get("/api/doctors/99999");

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Doctor not found");
  });

  it("should not expose password in public profile", async () => {
    const res = await request(app).get(`/api/doctors/${doctorId}`);

    expect(res.status).toBe(200);
    expect(res.body.doctor.password).toBeUndefined();
  });
});