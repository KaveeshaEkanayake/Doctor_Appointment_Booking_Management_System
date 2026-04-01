import request from "supertest";
import app     from "../app.js";
import prisma  from "../lib/prisma.js";
import bcryptjs from "bcryptjs";

let doctorId1;
let doctorId2;

beforeAll(async () => {
  await prisma.doctor.deleteMany({
    where: {
      email: {
        in: [
          "public.cardio@doctor.com",
          "public.neuro@doctor.com",
          "public.pending@doctor.com",
        ]
      }
    }
  });

  const hashed = await bcryptjs.hash("Test1234", 10);

  // Doctor 1 — APPROVED account + APPROVED profile
  const doc1 = await prisma.doctor.create({
    data: {
      firstName:      "Public",
      lastName:       "Cardio",
      email:          "public.cardio@doctor.com",
      password:       hashed,
      phone:          "0771111111",
      specialisation: "Cardiology",
      status:         "APPROVED",
      profileStatus:  "APPROVED",
      bio:            "Cardiology specialist",
      qualifications: "MBBS, MD",
      experience:     "10 years",
      consultationFee: 2500,
    }
  });
  doctorId1 = doc1.id;

  // Doctor 2 — APPROVED account + APPROVED profile, different specialisation
  const doc2 = await prisma.doctor.create({
    data: {
      firstName:      "Public",
      lastName:       "Neuro",
      email:          "public.neuro@doctor.com",
      password:       hashed,
      phone:          "0772222222",
      specialisation: "Neurology",
      status:         "APPROVED",
      profileStatus:  "APPROVED",
      bio:            "Neurology specialist",
      qualifications: "MBBS, MS",
      experience:     "8 years",
      consultationFee: 1500,
    }
  });
  doctorId2 = doc2.id;

  // Doctor 3 — PENDING account (should NOT appear in public listing)
  await prisma.doctor.create({
    data: {
      firstName:      "Public",
      lastName:       "Pending",
      email:          "public.pending@doctor.com",
      password:       hashed,
      phone:          "0773333333",
      specialisation: "Dermatology",
      status:         "PENDING",
      profileStatus:  "NOT_SUBMITTED",
    }
  });
});

afterAll(async () => {
  await prisma.doctor.deleteMany({
    where: {
      email: {
        in: [
          "public.cardio@doctor.com",
          "public.neuro@doctor.com",
          "public.pending@doctor.com",
        ]
      }
    }
  });
  await prisma.$disconnect();
});

describe("GET /api/doctors (public listing)", () => {

  it("✅ returns only approved doctors", async () => {
    const res = await request(app).get("/api/doctors");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.doctors)).toBe(true);

    const emails = res.body.doctors.map((d) => d.email);
    expect(emails).not.toContain("public.pending@doctor.com");
  });

  it("✅ does not require login", async () => {
    const res = await request(app).get("/api/doctors");
    expect(res.status).toBe(200);
  });

  it("✅ does not expose sensitive fields", async () => {
    const res = await request(app).get("/api/doctors");

    res.body.doctors.forEach((doc) => {
      expect(doc.password).toBeUndefined();
      expect(doc.email).toBeUndefined();
      expect(doc.phone).toBeUndefined();
    });
  });

  it("✅ filters by search query (firstName)", async () => {
    const res = await request(app).get("/api/doctors?search=Cardio");

    expect(res.status).toBe(200);
    const found = res.body.doctors.find((d) => d.lastName === "Cardio");
    expect(found).toBeDefined();
    const notFound = res.body.doctors.find((d) => d.lastName === "Neuro");
    expect(notFound).toBeUndefined();
  });

  it("✅ filters by specialisation query", async () => {
    const res = await request(app).get("/api/doctors?specialisation=Neurology");

    expect(res.status).toBe(200);
    res.body.doctors.forEach((doc) => {
      expect(doc.specialisation).toBe("Neurology");
    });
  });

  it("✅ returns empty array when search finds nothing", async () => {
    const res = await request(app).get("/api/doctors?search=zzznomatch");

    expect(res.status).toBe(200);
    expect(res.body.doctors).toHaveLength(0);
  });

  it("✅ search is case insensitive", async () => {
    const res = await request(app).get("/api/doctors?search=cardio");

    expect(res.status).toBe(200);
    const found = res.body.doctors.find((d) => d.lastName === "Cardio");
    expect(found).toBeDefined();
  });

  it("✅ returns both search and specialisation combined", async () => {
    const res = await request(app)
      .get("/api/doctors?search=Public&specialisation=Cardiology");

    expect(res.status).toBe(200);
    res.body.doctors.forEach((doc) => {
      expect(doc.specialisation).toBe("Cardiology");
    });
  });
});

describe("GET /api/doctors/:id (public single profile)", () => {

  it("✅ returns approved doctor by ID", async () => {
    const res = await request(app).get(`/api/doctors/${doctorId1}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.doctor.lastName).toBe("Cardio");
    expect(res.body.doctor.specialisation).toBe("Cardiology");
  });

  it("✅ does not require login", async () => {
    const res = await request(app).get(`/api/doctors/${doctorId1}`);
    expect(res.status).toBe(200);
  });

  it("✅ does not expose password", async () => {
    const res = await request(app).get(`/api/doctors/${doctorId1}`);
    expect(res.body.doctor.password).toBeUndefined();
  });

  it("❌ returns 404 for non-existent doctor", async () => {
    const res = await request(app).get("/api/doctors/99999");

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Doctor not found");
  });

  it("❌ returns 400 for invalid doctor ID", async () => {
    const res = await request(app).get("/api/doctors/abc");

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid doctor ID");
  });

  it("❌ returns 404 for pending doctor", async () => {
    const pendingDoctor = await prisma.doctor.findUnique({
      where: { email: "public.pending@doctor.com" }
    });

    const res = await request(app).get(`/api/doctors/${pendingDoctor.id}`);
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

});