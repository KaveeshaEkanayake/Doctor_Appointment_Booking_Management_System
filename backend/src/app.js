import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import doctorRoutes from "./routes/doctor.routes.js";
import doctorProfileRoutes from "./routes/doctor.profile.routes.js";

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

// Doctor profile routes (protected + public)
app.use("/api/doctor", doctorProfileRoutes);

// Public doctor listing
app.use("/api/doctors", doctorProfileRoutes);

export default app;