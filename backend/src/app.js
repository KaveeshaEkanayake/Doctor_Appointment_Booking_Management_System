import express              from "express";
import cors                 from "cors";
import swaggerUi            from "swagger-ui-express";
import { swaggerSpec }      from "./swagger.js";
import authRoutes           from "./routes/auth.routes.js";
import doctorRoutes         from "./routes/doctor.routes.js";
import doctorProtectedRoutes from "./routes/doctor.protected.routes.js";
import doctorPublicRoutes   from "./routes/doctor.public.routes.js";
import adminRoutes          from "./routes/admin.routes.js";
import patientProtectedRoutes from "./routes/patient.protected.routes.js";
import appointmentRoutes    from "./routes/appointment.routes.js";
import doctorAppointmentRoutes from "./routes/doctor.appointment.routes.js";
import doctorScheduleRoutes from "./routes/doctor.schedule.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
const app = express();

app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "https://medicarelk.vercel.app",
  "https://doctor-appointment-booking-manageme.vercel.app",
  "https://doctor-appointment-booki-git-cdacf1-kaveeshaekanayakes-projects.vercel.app"
];
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith(".vercel.app")) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

app.use(express.json());

// Swagger UI
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: "DAMS API Docs",
  customCss: ".swagger-ui .topbar { display: none }",
}));

// Auth routes
app.use("/api/auth",        authRoutes);
app.use("/api/auth/doctor", doctorRoutes);

// Doctor protected routes
app.use("/api/doctor",  doctorProtectedRoutes);

// Public doctor routes
app.use("/api/doctors", doctorPublicRoutes);

// Admin routes
app.use("/api/admin", adminRoutes);

app.use("/api/patient",      patientProtectedRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/doctor",       doctorAppointmentRoutes);
app.use("/api/doctor", doctorScheduleRoutes);
app.use("/api/payments", paymentRoutes);


export default app;