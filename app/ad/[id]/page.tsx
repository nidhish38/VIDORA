
"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

function AdPageContent() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const videoId = params.id;

  const [remaining, setRemaining] = useState(2);

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
            Your advertisement will appear here.
          </p>

          <p className="mt-2 text-sm text-gray-500">
            Ad code placeholder — not connected yet.
          </p>
        </div>

        <p className="mt-5 text-sm text-gray-300">
          After 2 seconds, click Continue to Watch Video.
        </p>

        {remaining > 0 && (
          <p className="mt-2 text-sm text-violet-300">
            Please wait {remaining} second
            {remaining === 1 ? "" : "s"}...
          </p>
        )}

        <button
          type="button"
          disabled={remaining > 0}
          onClick={() => router.push(`/watch/${videoId}`)}
          className="mt-5 inline-flex min-h-12 items-center justify-center rounded-xl bg-violet-600 px-7 py-3 font-semibold transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {remaining > 0
            ? `Continue in ${remaining}...`
            : "Continue to Watch Video →"}
        </button>
      </div>
    </main>
  );
}

export default function AdPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#0b0718] p-8 text-center text-white">
          Loading...
        </main>
      }
    >
      <AdPageContent />
    </Suspense>
  );
}
