import React from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center py-24">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Contact Us</h1>
          <p className="text-gray-500 text-lg max-w-md mx-auto">
            This page is coming soon. We're working on it!
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}