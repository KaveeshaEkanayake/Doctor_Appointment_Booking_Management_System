import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import doctorRoutes from "./routes/doctor.routes.js";
import doctorProtectedRoutes from "./routes/doctor.protected.routes.js";
import doctorPublicRoutes from "./routes/doctor.public.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import patientProtectedRoutes from "./routes/patient.protected.routes.js";
import appointmentRoutes from "./routes/appointment.routes.js";

const app = express();

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://doctor-appointment-booki-git-cdacf1-kaveeshaekanayakes-projects.vercel.app'
  ],
  credentials: true
}));

app.use(express.json());

// Auth routes
app.use("/api/auth", authRoutes);
app.use("/api/auth/doctor", doctorRoutes);

// Doctor protected routes (requires doctor JWT)
app.use("/api/doctor", doctorProtectedRoutes);

// Public doctor routes (no auth)
app.use("/api/doctors", doctorPublicRoutes);

// Admin routes
app.use("/api/admin", adminRoutes);

app.use("/api/patient", patientProtectedRoutes);

app.use("/api/appointments", appointmentRoutes);

export default app;