# MediCare — Doctor Appointment Booking System

A full-stack web application that streamlines the process of booking and managing doctor appointments. Patients can browse doctors, book appointments, and manage their profile. Doctors can manage their availability and appointments. Admins can approve doctors and oversee the platform.

---

## Tech Stack

**Frontend:** React 19, Vite, Tailwind CSS  
**Backend:** Node.js v22, Express v5  
**Database:** PostgreSQL (Neon.tech)  
**ORM:** Prisma v7 with PrismaPg driver adapter  
**Auth:** JWT  
**Email:** Nodemailer with Gmail SMTP  
**Scheduling:** node-cron  
**Testing:** Jest (backend), Vitest (frontend)  
**CI/CD:** GitHub Actions, Railway (backend), Vercel (frontend)

---

## Features

### Patient
- Register and login
- Browse and search doctors by name or specialisation
- View doctor public profiles
- Book appointments with available time slots
- View and manage appointments
- Reschedule pending or confirmed appointments
- Cancel pending or confirmed appointments
- Receive email reminders 24 hours before appointments

### Doctor
- Register and login
- Two-step profile setup (account approval + profile submission)
- Manage availability (days, times, appointment duration)
- View and confirm/reject appointments
- Receive email reminders 24 hours before appointments

### Admin
- Login to admin dashboard
- Approve or reject doctor registrations
- Review and approve doctor profiles
- View all doctors and their statuses

---

## Project Structure
├── backend/          # Express API server
│   ├── prisma/       # Schema, migrations, seed
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── middlewares/
│   │   ├── lib/
│   │   └── tests/
│   └── Dockerfile
├── frontend/         # React + Vite app
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── layouts/
│   │   └── tests/
└── .github/
└── workflows/    # CI/CD pipelines

---

## Getting Started

### Prerequisites
- Node.js v22.12.0+
- PostgreSQL database (or Neon.tech account)
- Gmail account with App Password (for email reminders)

### Clone the repository

```bash
git clone https://github.com/KaveeshaEkanayake/Doctor_Appointment_Booking_Management_System.git
cd Doctor_Appointment_Booking_Management_System
```

### Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` folder:

```env
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
EMAIL_USER=your_gmail_address
EMAIL_PASS=your_gmail_app_password
```

Run database migrations:

```bash
npx prisma migrate deploy
```

Seed the database (creates admin account):
```bash
npx prisma db seed
```

Start the development server:

```bash
npm run dev
```

Backend runs on `http://localhost:5000`  
API docs available at `http://localhost:5000/api/docs`

### Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend` folder:

```env
VITE_API_URL=http://localhost:5000
```

Start the development server:

```bash
npm run dev
```

Frontend runs on `http://localhost:5173`

---

## Default Admin Credentials
```
Email:    admin@dams.com
Password: Admin@1234
```

---

## Running Tests

### Backend

```bash
cd backend
npm test
```

### Frontend

```bash
cd frontend
npm test
```

---

## Email Reminders

Appointment reminders are automatically sent 24 hours before each appointment to both the patient and the doctor. The reminder job runs every hour and checks for upcoming appointments.

To enable email reminders, set the following environment variables:

```env
EMAIL_USER=your_gmail_address
EMAIL_PASS=your_gmail_app_password
```

To generate a Gmail App Password:
1. Enable 2-Step Verification on your Google account
2. Go to Google Account → Security → App Passwords
3. Create a new app password and use it as `EMAIL_PASS`

---

## CI/CD Pipeline

- Every push to `development` or `production` triggers GitHub Actions
- Pipeline runs: install → prisma generate → tests → migrate
- Railway auto-deploys backend on successful CI
- Vercel auto-deploys frontend on successful CI

### Branch Strategy
main          → production snapshot
production    → live production environment
development   → staging environment
feature/*     → feature branches (PR into development)

---

## Live Demo

- **Production:** https://medicarelk.vercel.app
- **Staging:** https://doctor-appointment-booki-git-cdacf1-kaveeshaekanayakes-projects.vercel.app
- **API:** https://doctorappointmentbookingmanagementsystem-production.up.railway.app/api/docs

---

## API Documentation

Swagger UI is available at `/api/docs` on both staging and production backend URLs.

---

## License

MIT
