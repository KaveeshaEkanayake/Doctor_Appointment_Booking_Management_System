// pages/appointment-review.jsx (Next.js Pages Router)
// or app/appointment/page.jsx (Next.js App Router)

import { useLocation } from "react-router-dom";
import AppointmentReview from "../components/AppointmentReview";

export default function AppointmentReviewPage() {
  return (
    <div>
      <AppointmentReview />
    </div>
  );
}

