import React, { useState } from "react"
import logo from "../Images/logo.png"

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)

  const navLinkClass =
    "px-3 py-2 rounded-lg transition hover:shadow-md hover:bg-gray-100"

  return (
    <header className="bg-blue-50 shadow px-6 py-4 w-full">
      <div className="flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center gap-3 font-bold text-lg text-gray-800">
        <img
            src={logo}
            alt="Rad Tech Logo"
            className="w-5 h-5 rounded-full"
        />
        <span>Rad Tech</span>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex gap-10 text-gray-800 font-semibold">
          <button className={navLinkClass}>Home</button>
          <button className={navLinkClass}>Instructions</button>
          <button className={navLinkClass}>About</button>
        </nav>

        {/* Hamburger Menu (Mobile) */}
        <button
          className="md:hidden flex flex-col justify-center items-center w-8 h-8 relative"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle menu"
        >
          <span
            className={`absolute h-1 w-8 bg-gray-800 rounded transition-transform duration-300 ${
              isOpen ? "rotate-45 translate-y-0" : "-translate-y-2"
            }`}
          ></span>
          <span
            className={`absolute h-1 w-8 bg-gray-800 rounded transition-opacity duration-300 ${
              isOpen ? "opacity-0" : "opacity-100"
            }`}
          ></span>
          <span
            className={`absolute h-1 w-8 bg-gray-800 rounded transition-transform duration-300 ${
              isOpen ? "-rotate-45 translate-y-0" : "translate-y-2"
            }`}
          ></span>
        </button>
      </div>

      {/* Mobile Dropdown */}
      {isOpen && (
        <div className="flex justify-center mt-3">
          <div className="flex flex-col space-y-2 md:hidden font-semibold text-gray-800 text-center">
            <button
              className={navLinkClass}
              onClick={() => setIsOpen(false)}
            >
              Home
            </button>
            <button
              className={navLinkClass}
              onClick={() => setIsOpen(false)}
            >
              Instructions
            </button>
            <button
              className={navLinkClass}
              onClick={() => setIsOpen(false)}
            >
              About
            </button>
          </div>
        </div>
      )}
    </header>
  )
}
