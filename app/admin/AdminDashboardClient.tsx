
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Video = {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  video_url: string;
  thumbnail_url: string | null;
  created_at: string;
};

function getStoragePath(url: string | null): string | null {
  if (!url) return null;

  const marker = "/storage/v1/object/public/videos/";
  const index = url.indexOf(marker);

  if (index === -1) return null;

  try {
    return decodeURIComponent(
      url.slice(index + marker.length).split("?")[0]
    );
  } catch {
    return null;
  }
}

export default function AdminDashboardClient() {
  const router = useRouter();

  const [supabase] = useState(() => createClient());
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadVideos() {
      const { data: authData, error: authError } =
        await supabase.auth.getUser();

      if (authError || !authData.user) {
        router.replace("/admin/login");
        return;
      }

      const { data, error: fetchError } = await supabase
        .from("videos")
        .select(
          "id, title, description, category, video_url, thumbnail_url, created_at"
        )
        .order("created_at", { ascending: false });

      if (fetchError) {
        setError("Unable to load videos. Please refresh and try again.");
      } else {
        setVideos((data ?? []) as Video[]);
      }

      setLoading(false);
    }

    loadVideos();
  }, [router, supabase]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/admin/login");
    router.refresh();
  }

  async function handleDelete(video: Video) {
    const confirmed = window.confirm(
      `Permanently delete "${video.title}" and its stored files? This cannot be undone.`
    );

    if (!confirmed) return;

    setDeletingId(video.id);
    setError("");

    try {
      const videoPath = getStoragePath(video.video_url);
      const thumbnailPath = getStoragePath(video.thumbnail_url);

      if (!videoPath) {
        setError(
          `Cannot identify the storage path for "${video.title}". Nothing was deleted.`
        );
        return;
      }

      const paths = [
        ...new Set(
          [videoPath, thumbnailPath].filter(
            (path): path is string => Boolean(path)
          )
        ),
      ];

      // Remove the stored video and thumbnail.
      const { error: storageError } = await supabase.storage
        .from("videos")
        .remove(paths);

      if (storageError) {
        setError(
          `Could not delete the stored files for "${video.title}". ${storageError.message}`
        );
        return;
      }

      // Remove the database record.
      const { error: databaseError } = await supabase
        .from("videos")
        .delete()
        .eq("id", video.id);

      if (databaseError) {
        setError(
          `The files were removed, but the database record could not be deleted. Please check Supabase permissions.`
        );
        return;
      }

      setVideos((current) =>
        current.filter((item) => item.id !== video.id)
      );
    } catch {
      setError("An unexpected error occurred while deleting the video.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <main className="min-h-screen bg-[#0b0718] p-4 text-white sm:p-8">
      <div className="mx-auto max-w-5xl">
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <Link
              href="/"
              className="text-sm text-violet-300 hover:text-violet-200"
            >
              ← Back to VIDORA
            </Link>

            <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
              VIDORA Admin
            </h1>

            <p className="mt-2 text-gray-400">
              Manage your uploaded videos.
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="min-h-11 rounded-xl border border-white/15 px-5 py-3 font-semibold transition hover:bg-white/10"
          >
            Sign out
          </button>
        </header>

        <section className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-2xl font-semibold">
                Video Management
              </h2>

              <p className="mt-2 text-sm text-gray-400">
                {videos.length}{" "}
                {videos.length === 1 ? "video" : "videos"} uploaded
              </p>
            </div>

            <Link
              href="/admin/upload"
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-violet-600 px-5 py-3 font-semibold transition hover:bg-violet-500"
            >
              + Upload video
            </Link>
          </div>

          {error && (
            <div
              role="alert"
              className="mt-5 rounded-xl border border-red-400/20 bg-red-500/10 p-4 text-sm text-red-300"
            >
              {error}
            </div>
          )}

          {loading ? (
            <p className="py-12 text-center text-gray-400">
              Loading your videos...
            </p>
          ) : videos.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-gray-300">
                No videos uploaded yet.
              </p>
              <p className="mt-2 text-sm text-gray-500">
                Upload your first video to get started.
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {videos.map((video) => (
                <article
                  key={video.id}
                  className="flex flex-col gap-4 rounded-xl border border-white/10 bg-black/20 p-3 sm:flex-row sm:items-center sm:p-4"
                >
                  <div className="aspect-video w-full overflow-hidden rounded-lg bg-black sm:w-44 sm:shrink-0">
                    {video.thumbnail_url ? (
                      <img
                        src={video.thumbnail_url}
                        alt={video.title}
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-gray-500">
                        No thumbnail
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="break-words text-lg font-semibold">
                      {video.title}
                    </h3>

                    <p className="mt-1 text-sm text-violet-300">
                      {video.category || "Other"}
                    </p>

                    <p className="mt-2 line-clamp-2 break-words text-sm text-gray-400">
                      {video.description || "No description"}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <a
                        href={`/watch/${video.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex min-h-10 items-center rounded-lg border border-violet-400/30 px-4 py-2 text-sm font-semibold text-violet-300 hover:bg-violet-500/10"
                      >
                        Watch video ↗
                      </a>

                      <button
                        type="button"
                        onClick={() => handleDelete(video)}
                        disabled={deletingId !== null}
                        className="inline-flex min-h-10 items-center justify-center rounded-lg border border-red-400/30 px-4 py-2 text-sm font-semibold text-red-300 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {deletingId === video.id
                          ? "Deleting..."
                          : "Delete video"}
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
