
"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

function DownloadAdContent() {
  const params = useParams<{ id: string }>();
  const videoId = params.id;

  const [remaining, setRemaining] = useState(2);
  const [videoUrl, setVideoUrl] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setRemaining(2);

    const timer = window.setTimeout(() => {
      setRemaining(1);
    }, 1000);

    const secondTimer = window.setTimeout(() => {
      setRemaining(0);
    }, 2000);

    return () => {
      window.clearTimeout(timer);
      window.clearTimeout(secondTimer);
    };
  }, [videoId]);

  useEffect(() => {
    let cancelled = false;

    async function loadVideo() {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();

      const { data, error } = await supabase
        .from("videos")
        .select("video_url")
        .eq("id", videoId)
        .single();

      if (cancelled) return;

      if (error || !data) {
        setError("Unable to find this video. Please return and try again.");
      } else {
        setVideoUrl(data.video_url);
      }
    }

    if (videoId) loadVideo();

    return () => {
      cancelled = true;
    };
  }, [videoId]);

  function downloadVideo() {
    if (!videoUrl) return;

    const link = document.createElement("a");
    link.href = videoUrl;
    link.download = "";
    link.target = "_blank";
    link.rel = "noreferrer";
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0b0718] p-5 text-white">
      <div className="w-full max-w-2xl text-center">
        <Link
          href="/"
          className="text-xl font-bold tracking-wide text-violet-400"
        >
          VIDORA
        </Link>

        <h1 className="mt-10 text-3xl font-bold">
          Advertisement
        </h1>

        <div className="mt-6 flex min-h-64 flex-col items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <p className="text-gray-300">
            Your download advertisement will appear here.
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Ad code placeholder — not connected yet.
          </p>
        </div>

        <p className="mt-5 text-sm text-gray-300">
          After 2 seconds, click Continue to Download Video.
        </p>

        {remaining > 0 && (
          <p className="mt-2 text-sm text-violet-300">
            Please wait {remaining} second{remaining === 1 ? "" : "s"}...
          </p>
        )}

        {error && (
          <p className="mt-4 text-sm text-red-300">{error}</p>
        )}

        <button
          type="button"
          disabled={remaining > 0 || !videoUrl || Boolean(error)}
          onClick={downloadVideo}
          className="mt-5 inline-flex min-h-12 items-center justify-center rounded-xl bg-violet-600 px-7 py-3 font-semibold transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {remaining > 0
            ? `Continue in ${remaining}...`
            : "Continue to Download Video →"}
        </button>

        <p className="mt-4 text-sm text-gray-500">
          Your download will start when you continue.
        </p>

        <Link
          href={`/watch/${videoId}`}
          className="mt-6 block text-sm text-violet-300 hover:text-violet-200"
        >
          ← Return to video
        </Link>
      </div>
    </main>
  );
}

export default function DownloadAdPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#0b0718] p-8 text-center text-white">
          Loading...
        </main>
      }
    >
      <DownloadAdContent />
    </Suspense>
  );
}
