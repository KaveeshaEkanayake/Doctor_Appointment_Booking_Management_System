import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import doctorRoutes from "./routes/doctor.routes.js";

const app = express();

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://doctor-appointment-booki-git-cdacf1-kaveeshaekanayakes-projects.vercel.app'
  ],
  credentials: true
}));

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/doctor", doctorRoutes);

export default app;