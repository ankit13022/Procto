"use client";
import React from "react";
import Navbar from "../components/navbar";
import SearchForm from "../components/serchform";

export default function Home() {
  return (
    <div className="w-full">
      <Navbar />
      <div className="w-full h-10 bg-gray-200"></div>
      <section className="bg-[#2d3180] text-white py-16 pb-32 px-6 text-center relative">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Your home for health</h1>
        <p className="text-lg font-medium mb-8">Find and Book</p>

        <SearchForm />

      </section>
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 py-6 px-4 text-center text-sm font-medium border-t border-gray-200 border-b-2 ">
        <div>Consult with a doctor</div>
        <div>Order Medicines</div>
        <div>View medical records</div>
        <div>Book test</div>
        <div>Read articles</div>
        <div>For healthcare providers</div>
      </div>
    </div>
  );
}