"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/navbar";
import SearchForm from "@/components/serchform";

export default function Doctors() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const search = searchParams?.get("search") || "";
  const specialty = searchParams?.get("specialty") || "";
  const location = searchParams?.get("location") || "";

  const [doctors, setDoctors] = useState([]);
  const [page, setPage] = useState(1);
  const [size] = useState(5);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fallbackImage = "/default-doc.webp";
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  const formatExp = (exp) =>
    typeof exp === "number" ? `${exp} years` : exp || "Experience not listed";

  useEffect(() => {
    const abortCtrl = new AbortController();
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        setError(null);

        const url = new URL(`${backendUrl}/api/doctors`);
        url.searchParams.set("page", page);
        url.searchParams.set("size", size);
        if (search) url.searchParams.set("search", search);
        if (specialty) url.searchParams.set("specialty", specialty);
        if (location) url.searchParams.set("location", location);

        const res = await fetch(url.toString(), { signal: abortCtrl.signal });
        if (!res.ok) throw new Error(`Failed to fetch (${res.status})`);
        const data = await res.json();

        const docs = Array.isArray(data.doctors)
          ? data.doctors
          : data.items || [];
        setDoctors(docs);

        const tot = typeof data.total === "number" ? data.total : docs.length;
        setTotal(tot);

        setTotalPages(
          typeof data.totalPages === "number"
            ? data.totalPages
            : Math.max(1, Math.ceil(tot / size))
        );
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error(err);
          setError(err.message || "Failed to fetch doctors");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
    return () => abortCtrl.abort();
  }, [search, specialty, location, page, size]);

  const onBackToSearch = () => router.push("/");
  const onBook = (doc) => router.push(`/book/${doc.id}`);
  const onContact = (doc) =>
    alert(`Contact clinic for ${doc.name || "doctor"}`);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <Navbar />
      </div>

      <div className="bg-white border-b flex justify-center items-center">
        <div className="px-4 py-4">
          <SearchForm />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="bg-[#2d3180] text-white rounded-md px-4 py-3 mb-6 flex flex-wrap gap-3 items-center">
          {["Gender", "Patient Stories", "Experience", "All Filters"].map(
            (label) => (
              <button
                key={label}
                className="bg-[#3b3f98] px-3 py-2 rounded flex items-center gap-2"
              >
                {label} <span>▾</span>
              </button>
            )
          )}
          <div className="ml-auto flex items-center gap-3">
            <span className="text-sm text-[#cbd2ff]">Sort By</span>
            <select
              className="rounded p-2 bg-[#3b3f98] border border-[#34386e]"
              defaultValue="relevance"
            >
              <option value="relevance">Relevance</option>
              <option value="rating">Rating</option>
              <option value="experience">Experience</option>
            </select>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-semibold">
            {total} {specialty || "Doctors"}{" "}
            {location && `available in ${location}`}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Book appointments with minimum wait-time & verified doctor details
          </p>
        </div>

        {loading ? (
          <div className="text-center py-16">Loading doctors...</div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">Error: {error}</div>
        ) : doctors.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">
              No doctors found matching your criteria.
            </p>
            <button
              onClick={onBackToSearch}
              className="mt-4 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            >
              Back to Search
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-6">
              {doctors.map((doc) => {
                const id = doc.id ?? doc._id ?? Math.random();
                const name = doc.name ?? "Doctor Name";
                const designation =
                  doc.designation ?? doc.specialty ?? "Specialist";
                const exp = formatExp(doc.experience ?? doc.experienceYears);
                const clinic =
                  doc.clinicName ?? (doc.clinics ? doc.clinics[0] : "");
                const loc = doc.locations ?? doc.location ?? "";
                const fee = doc.fee ?? doc.consultationFee ?? "—";
                const rating = doc.rating ?? null;
                const patientStories =
                  doc.patientStories ?? doc.reviewsCount ?? 0;
                const imageUrl = doc.imageUrl ?? doc.photo ?? fallbackImage;
                const availableToday = !!doc.availableToday;

                return (
                  <div
                    key={id}
                    className="border rounded-lg p-5 flex flex-col md:flex-row gap-4 bg-white"
                  >
                    <img
                      src={imageUrl}
                      alt={name}
                      onError={(e) => (e.currentTarget.src = fallbackImage)}
                      className="w-20 h-20 rounded-full object-cover border"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between gap-4">
                        <div>
                          <h3 className="text-xl font-semibold text-[#2b6cb0]">
                            {name}
                          </h3>
                          <div className="text-gray-600 mt-1 text-sm">
                            {designation}
                          </div>
                          <div className="text-sm mt-1">{exp}</div>
                          <div className="text-sm mt-1 text-gray-700">
                            {clinic && (
                              <>
                                <span className="font-medium">{clinic}</span>
                                <span className="text-gray-500"> • </span>
                              </>
                            )}
                            <span>{loc}</span>
                          </div>
                          <div className="text-sm mt-1 text-gray-700">
                            ₹{fee} Consultation Fees
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-3">
                          {availableToday ? (
                            <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                              ✔ Available Today
                            </div>
                          ) : (
                            <div className="text-sm text-gray-500">
                              No slots today
                            </div>
                          )}
                          <button
                            onClick={() => onBook({ id })}
                            className="bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded"
                          >
                            Book Clinic Visit
                          </button>
                          <button
                            onClick={() => onContact({ id })}
                            className="border border-gray-300 px-4 py-2 rounded text-gray-700 hover:bg-gray-50"
                          >
                            Contact Clinic
                          </button>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center gap-4">
                        <div className="px-2 py-1 bg-green-600 rounded text-white text-sm font-medium">
                          {rating ? `${Math.round(rating)}%` : "—"}
                        </div>
                        <div className="text-sm text-gray-600">
                          {patientStories} Patient Stories
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between mt-8 text-sm">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-4 py-2 bg-gray-100 rounded disabled:opacity-50"
              >
                Previous
              </button>
              <span>
                Page {page} of {totalPages} • {total} doctors
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-4 py-2 bg-gray-100 rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
