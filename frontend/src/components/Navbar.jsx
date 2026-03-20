import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import logoImg from "../assets/Logo04.PNG";
import { FaBars, FaTimes, FaUser, FaLock } from "react-icons/fa";

export default function Navbar() {

    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    const navItems = [
        { path: "/homepage", name: "Home" },
        { path: "/doctors", name: "Doctors" },
        { path: "/about", name: "About" },
        { path: "/contact", name: "Contact Us" },
    ];

    return (
        <header className="relative flex justify-between items-center px-4 md:px-6 py-4">

            {/* LEFT: Hamburger + Logo */}
            <div className="flex items-center gap-3 md:ml-14">
                
                {/* Hamburger */}
                <button
                    className="md:hidden text-xl"
                    onClick={() => setIsOpen(true)}
                >
                    <FaBars />
                </button>

                {/* Logo */}
                <img
                    src={logoImg}
                    alt="Logo"
                    className="h-10 cursor-pointer"
                    onClick={() => navigate("/homepage")}
                />
            </div>

            {/* CENTER: Desktop Nav */}
            <nav className="hidden md:flex gap-6 text-gray-600 font-medium">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                            `px-2 py-1 ${
                                isActive
                                    ? "text-[#0E82FD] font-semibold"
                                    : "text-gray-600"
                            } hover:text-[#0E82FD] transition`
                        }
                    >
                        {item.name}
                    </NavLink>
                ))}
            </nav>

            {/* RIGHT: Desktop Buttons */}
            <div className="hidden md:flex gap-3 items-center mr-14">
                <button
                    onClick={() => navigate("/register")}
                    className="flex items-center gap-2 px-4 py-1 bg-blue-600 text-white rounded-full hover:bg-blue-500"
                >
                    <FaUser /> Register
                </button>

                <button
                    onClick={() => navigate("/login")}
                    className="flex items-center gap-2 px-4 py-1 bg-[#4486CC] text-white rounded-full hover:bg-[#3672A8]"
                >
                    <FaLock /> Log In
                </button>
            </div>

            {/* MOBILE MENU */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-50"
                    onClick={() => setIsOpen(false)}
                >
                    {/* Sidebar */}
                    <div
                        className="w-64 h-full bg-white p-5"
                        onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
                    >

                        {/* Header */}
                        <div className="flex justify-between items-center mb-6">
                            <img src={logoImg} className="h-8" />
                            <FaTimes
                                className="text-xl cursor-pointer"
                                onClick={() => setIsOpen(false)}
                            />
                        </div>

                        {/* Links */}
                        <div className="flex flex-col gap-4">
                            {navItems.map((item) => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setIsOpen(false)}
                                    className="text-gray-700 hover:text-blue-600"
                                >
                                    {item.name}
                                </NavLink>
                            ))}
                        </div>

                        {/* Buttons */}
                        <div className="mt-6 flex flex-col gap-3">
                            <button
                                onClick={() => {
                                    navigate("/register");
                                    setIsOpen(false);
                                }}
                                className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-full"
                            >
                                <FaUser /> Register
                            </button>

                            <button
                                onClick={() => {
                                    navigate("/login");
                                    setIsOpen(false);
                                }}
                                className="flex items-center justify-center gap-2 px-4 py-2 bg-[#4486CC] text-white rounded-full"
                            >
                                <FaLock /> Log In
                            </button>
                        </div>

                    </div>
                </div>
            )}
        </header>
    );
}