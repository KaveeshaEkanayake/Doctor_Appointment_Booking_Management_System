import React from "react";
import DoctorLayout from "../layouts/DoctorLayout";

export default function DoctorDashboard() {
  return (
    <DoctorLayout>
      <div className="p-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-2">
          Welcome to your doctor dashboard. This page is under construction.
        </p>
      </div>
    </DoctorLayout>
  );
}