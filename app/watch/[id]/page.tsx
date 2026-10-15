
"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Video = {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  video_url: string;
  thumbnail_url: string | null;
  duration_seconds: number | null;
  created_at: string;
};

// First banner: 728 x 90
function AdsterraBanner() {
  useEffect(() => {
    const container = document.getElementById("adsterra-banner");
    if (!container) return;

    const options = {
      key: "95a40d08b0cea3823586748d937434b0",
      format: "iframe",
      height: 90,
      width: 728,
      params: {},
    };

    const config = document.createElement("script");
    config.text = `var atOptions = ${JSON.stringify(options)};`;

    const adScript = document.createElement("script");
    adScript.src =
      "https://bancadeltempoidea.org/22/95a40d08b0cea3823586748d937434b0";
    adScript.async = true;

    container.replaceChildren(config, adScript);

    return () => {
      container.replaceChildren();
    };
  }, []);

  return (
    <div className="mb-5 flex min-h-[90px] w-full items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]">
      <div
        id="adsterra-banner"
        className="flex min-h-[90px] w-full items-center justify-center"
      />
    </div>
  );
}

// Second banner: 300 x 250
function AdsterraSecondBanner() {
  useEffect(() => {
    const container = document.getElementById(
      "adsterra-second-banner"
    );
    if (!container) return;

    const options = {
      key: "e5eb904545f82316ce8dbb02c607def6",
      format: "iframe",
      height: 250,
      width: 300,
      params: {},
    };

    const config = document.createElement("script");
    config.text = `var atOptions = ${JSON.stringify(options)};`;

    const adScript = document.createElement("script");
    adScript.src = "https://bancadeltempoidea.org/22/e5eb904545f82316ce8dbb02c607def6";
    adScript.async = true;

    container.replaceChildren(config, adScript);

    return () => {
      container.replaceChildren();
    };
  }, []);

  return (
    <div className="mt-5 flex min-h-[250px] w-full justify-center overflow-hidden rounded-xl border border-white/10 bg-white/[0.03]">
      <div
        id="adsterra-second-banner"
        className="flex min-h-[250px] w-[300px] max-w-full items-center justify-center"
      />
    </div>
  );
}

function WatchPageContent() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const [video, setVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadVideo() {
      setLoading(true);
      setError("");

      const { data, error } = await supabase
        .from("videos")
        .select("*")
        .eq("id", params.id)
        .single();

      if (cancelled) return;

      if (error || !data) {
        setError("Video not found or unable to load it.");
        setVideo(null);
      } else {
        setVideo(data as Video);
      }

      setLoading(false);
    }

    if (params.id) {
      loadVideo();
    }

    return () => {
      cancelled = true;
    };
  }, [params.id, supabase]);

  useEffect(() => {
    return () => {
      document.querySelectorAll("video").forEach((player) => {
        player.pause();
        player.removeAttribute("src");
        player.load();
      });
    };
  }, []);

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-[#0b0718] p-4 text-white sm:p-5 md:p-10">
      <div className="mx-auto w-full max-w-5xl">
        <button
          type="button"
          onClick={() => router.push("/")}
          className="mb-6 inline-flex min-h-11 items-center text-violet-300 hover:text-violet-200"
        >
          ← Back to VIDORA
        </button>

        {loading ? (
          <div className="py-20 text-center text-gray-400">
            Loading video...
          </div>
        ) : error || !video ? (
          <div className="rounded-2xl border border-white/10 p-8 text-center">
            <h1 className="text-xl font-bold">
              Unable to load video
            </h1>
            <p className="mt-3 text-gray-400">
              {error || "This video could not be found."}
            </p>
            <button
              type="button"
              onClick={() => router.push("/")}
              className="mt-5 rounded-xl bg-violet-600 px-5 py-3 font-semibold hover:bg-violet-500"
            >
              Back to homepage
            </button>
          </div>
        ) : (
          <>
            {/* First banner */}
            <AdsterraBanner />

            {/* Video player */}
            <div className="w-full overflow-hidden rounded-2xl bg-black">
              <video
                className="block aspect-video w-full bg-black object-contain"
                src={video.video_url}
                controls
                playsInline
                preload="metadata"
              >
                Your browser does not support HTML video.
              </video>
            </div>

            {/* Second banner */}
            <AdsterraSecondBanner />

            {/* Video details */}
            <div className="mt-5 min-w-0">
              <h1 className="break-words text-2xl font-bold leading-tight sm:text-3xl">
                {video.title}
              </h1>

              <p className="mt-3 inline-block rounded-full bg-violet-500/15 px-3 py-1 text-sm font-medium text-violet-300">
                {video.category || "Other"}
              </p>

              <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <h2 className="mb-2 text-sm font-semibold text-gray-200">
                  About this video
                </h2>
                <p className="whitespace-pre-wrap break-words text-sm leading-6 text-gray-300">
                  {video.description || "No description provided."}
                </p>
              </div>

              {/* Download button */}
              <a
                href={`/download-ad/${video.id}`}
                className="mt-5 flex min-h-12 w-full items-center justify-center rounded-xl bg-violet-600 px-5 py-3 text-center font-semibold transition hover:bg-violet-500 sm:w-fit"
              >
                ↓ Download video
              </a>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

export default function WatchPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#0b0718] p-8 text-center text-white">
          Loading video...
        </main>
      }
    >
      <WatchPageContent />
    </Suspense>
  );
}
