"use client";
import React from "react";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="flex justify-between items-center px-6 py-3 shadow-sm border-b border-gray-200 h-20">
      <Link href="/" className="flex items-center space-x-2">
        <span className="text-[#00a0dc] font-bold text-2xl">•practo•</span>
      </Link>

      <div className="hidden md:flex items-center space-x-8 text-gray-700 font-medium">
        <Link
          href="#"
          className="border-b-2 border-transparent hover:border-[#00a0dc] hover:text-[#00a0dc] pb-1"
        >
          Find Doctors
        </Link>
        <Link href="#" className="hover:text-[#00a0dc]">
          Video Consult
        </Link>
        <Link href="#" className="hover:text-[#00a0dc]">
          Surgeries
        </Link>
      </div>

      <div className="hidden md:flex items-center space-x-5 text-gray-600">
        <Link href="#" className="hover:text-[#00a0dc]">
          For Corporates
        </Link>
        <Link href="#" className="hover:text-[#00a0dc]">
          For Providers
        </Link>
        <Link href="#" className="hover:text-[#00a0dc]">
          Security & help
        </Link>
        <button className="border border-gray-300 px-4 py-1 rounded hover:bg-gray-100">
          Login / Signup
        </button>
      </div>
    </nav>
  );
}
