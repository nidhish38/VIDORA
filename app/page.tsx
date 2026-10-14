
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Video = {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  video_url: string;
  thumbnail_url: string | null;
  created_at: string;
  duration_seconds: number | null;
};

const categories = [
  "All",
  "MOM",
  "Bhabhi",
  "Affair",
  "outdoor",
  "Spy Cam",
  "Gangbang",
  "Other",
];

function formatDuration(seconds: number | null | undefined) {
  if (!seconds || seconds < 0) return "0:00";

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    return `${hours}:${String(remainingMinutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
  }

  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

export default function Home() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [supabase] = useState(() => createClient());
  useEffect(() => {
    async function loadVideos() {
      const { data, error } = await supabase
        .from("videos")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        setError("Unable to load videos. Please try again.");
      } else {
        setVideos((data ?? []) as Video[]);
      }

      setLoading(false);
    }

    loadVideos();
  }, []);

  const filteredVideos = videos.filter((video) => {
    const term = search.toLowerCase().trim();

    const matchesSearch =
      video.title.toLowerCase().includes(term) ||
      (video.description ?? "").toLowerCase().includes(term) ||
      (video.category ?? "Other").toLowerCase().includes(term);

    const matchesCategory =
      category === "All" ||
      (video.category ?? "Other") === category;

    return matchesSearch && matchesCategory;
  });

  return (
    <main className="min-h-screen bg-[#0b0718] text-white">
      
<header className="sticky top-0 z-50 border-b border-white/10 bg-[#0b0718]/95 backdrop-blur-xl">
  <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-5 sm:py-4">
    <Link
      href="/"
      className="shrink-0 text-2xl font-black tracking-tight sm:text-3xl"
    >
      <span className="text-violet-400">VID</span>ORA
    </Link>

    <Link
      href="/admin/login"
      className="inline-flex min-h-10 items-center justify-center rounded-xl border border-white/15 px-4 py-2 text-sm font-semibold transition hover:border-violet-400/50 hover:bg-white/10"
    >
      Admin
    </Link>
  </div>
</header>

     <section className="mx-auto max-w-7xl px-5 pb-10 pt-12">
        <div className="rounded-3xl border border-violet-400/20 bg-gradient-to-br from-violet-950 via-[#17102b] to-[#0b0718] px-6 py-12 md:px-12 md:py-16">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-violet-300">
            Your video destination
          </p>

          <h1 className="max-w-3xl text-4xl font-black leading-tight md:text-6xl">
            Discover videos.
            <span className="block text-violet-400">
              Watch what you love.
            </span>
          </h1>

          <p className="mt-5 max-w-xl text-gray-300">
            Explore videos across Bhabhi, MOM, spy cam,and more.
          </p>

          
<div className="mt-6 flex w-full max-w-2xl gap-2 sm:mt-8 sm:gap-3">
  <div className="relative min-w-0 flex-1">
    <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
    </span>

    <input
      type="search"
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          document.getElementById("videos")?.scrollIntoView({
            behavior: "smooth",
          });
        }
      }}
      placeholder="Search videos..."
      aria-label="Search videos"
      className="h-12 w-full min-w-0 rounded-xl border border-white/10 bg-black/30 pl-10 pr-3 outline-none placeholder:text-gray-500 focus:border-violet-400 sm:h-14 sm:pl-11 sm:pr-4"
    />
  </div>

  <button
    type="button"
    onClick={() => {
      document.getElementById("videos")?.scrollIntoView({
        behavior: "smooth",
      });
    }}
    className="min-h-12 shrink-0 rounded-xl bg-violet-600 px-4 font-semibold transition hover:bg-violet-500 sm:min-h-14 sm:px-6"
  >
    Search
  </button>
</div>

        </div>
      </section>

      <section
        id="videos"
        className="mx-auto max-w-7xl scroll-mt-6 px-5 pb-16"
      >
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-bold md:text-3xl">
            Explore videos
          </h2>
          <p className="text-sm text-gray-400">
            {filteredVideos.length} videos
          </p>
        </div>

        <div className="mb-8 flex gap-2 overflow-x-auto overscroll-x-contain pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {categories.map((item) => (
            <button
              key={item}
              onClick={() => setCategory(item)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${
                category === item
                  ? "bg-violet-600 text-white"
                  : "border border-white/10 bg-white/5 text-gray-300 hover:bg-white/10"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="py-20 text-center text-gray-400">
            Loading videos...
          </div>
        ) : error ? (
          <div className="py-20 text-center text-red-300">
            {error}
          </div>
        ) : filteredVideos.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-16 text-center">
            <h3 className="text-xl font-semibold">
              No videos found
            </h3>
            <p className="mt-2 text-gray-400">
              Try another search or upload a video later.
            </p>

            {(search || category !== "All") && (
              <button
                onClick={() => {
                  setSearch("");
                  setCategory("All");
                }}
                className="mt-5 rounded-lg bg-violet-600 px-5 py-3 font-semibold"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
            {filteredVideos.map((video) => (
              <Link
                key={video.id}
                href={`/ad/${video.id}`}
                className="group min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition hover:-translate-y-1 hover:border-violet-400/50 hover:bg-white/[0.06]"
              >
                <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-violet-950 via-[#21143c] to-black">
                  {video.thumbnail_url ? (
                    <img
                      src={video.thumbnail_url}
                      alt={video.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <span className="text-5xl font-black text-violet-400/70">
                        VID
                      </span>
                    </div>
                  )}

                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/30">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-600 text-xl shadow-lg">
                      ▶
                    </span>
                  </div>
                  
                  <span className="absolute bottom-3 left-3 rounded-md bg-black/70 px-2 py-1 text-xs text-white">
                    {video.category || "Other"}
                  </span>

                  <span className="absolute bottom-3 right-3 rounded-md bg-black/80 px-2 py-1 text-xs font-semibold text-white">
                    {formatDuration(video.duration_seconds)}
                  </span>

                </div>

                <div className="p-3 sm:p-4">
                  <h3 className="line-clamp-2 break-words text-sm font-bold group-hover:text-violet-300 sm:text-lg">
                    {video.title}
                  </h3>

                  <p className="mt-2 line-clamp-2 break-words text-xs leading-5 text-gray-400 sm:text-sm sm:leading-6">
                    {video.description || "Watch this video on VIDORA."}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      
<footer className="mt-8 border-t border-white/10 px-4 py-8 sm:px-6">
  <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 text-center sm:flex-row sm:text-left">
    <Link href="/" className="text-xl font-black tracking-tight">
      <span className="text-violet-400">VID</span>ORA
    </Link>

    <p className="text-xs leading-5 text-gray-500 sm:text-sm">
      Discover videos. Watch what you love.
    </p>

    <p className="text-xs text-gray-500 sm:text-sm">
      © 2026 VIDORA. All rights reserved.
    </p>
  </div>
</footer>
    </main>
  );
}
