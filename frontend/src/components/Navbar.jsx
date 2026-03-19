import React from "react";
import { NavLink } from "react-router-dom";
import logoImg from "../assets/Logo04.PNG";
import { FaBars, FaUser, FaLock } from "react-icons/fa";

export default function Navbar() {
    return (
        <header className="relative flex justify-between items-center px-6 py-4 bg-transparent">
            
            {/* Logo */}
            <div className="flex items-center gap-2 ml-14">
                <img src={logoImg} alt="MediCare Logo" className="h-10" />
            </div>

            {/* Navigation Links */}
            <nav className="hidden md:flex gap-6 text-gray-600 font-medium">
                <NavLink to="/homepage">Home</NavLink>
                <NavLink to="/doctors">Doctors</NavLink>
                <NavLink to="/about">About</NavLink>
                <NavLink to="/contact">Contact Us</NavLink>
            </nav>

            {/* Buttons */}
            <div className="flex gap-3 items-center">
                <button className="flex items-center gap-2 px-4 py-1 bg-blue-600 text-white rounded-full hover:bg-blue-500">
                    <FaUser /> Register
                </button>
                <button className="flex items-center gap-2 px-4 py-1 bg-[#4486CC] text-white rounded-full mr-14 hover:bg-[#3672A8]">
                    <FaLock /> Log In
                </button>
                <FaBars className="md:hidden text-xl cursor-pointer" />
            </div>
        </header>
    );
}