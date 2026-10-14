
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function UploadPage() {
  const router = useRouter();
  const supabase = createClient();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Other");
  const [file, setFile] = useState<File | null>(null);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");

    if (!file) {
      setMessage("Please select a video file.");
      return;
    }

    if (!file.type.startsWith("video/")) {
      setMessage("Please select a valid video file.");
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setMessage("This video exceeds the 50 MB free-plan limit.");
      return;
    }

    setLoading(true);

    const { data: userData, error: userError } =
      await supabase.auth.getUser();

    if (userError || !userData.user) {
      setLoading(false);
      router.push("/admin/login");
      return;
    }

    let thumbnailUrl: string | null = null;

if (thumbnail) {
  if (!thumbnail.type.startsWith("image/")) {
    setLoading(false);
    setMessage("Please select a valid thumbnail image.");
    return;
  }

  if (thumbnail.size > 5 * 1024 * 1024) {
    setLoading(false);
    setMessage("Thumbnail must be smaller than 5 MB.");
    return;
  }

  const thumbnailPath =
    `${userData.user.id}/${crypto.randomUUID()}-${thumbnail.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;

  const { error: thumbnailError } = await supabase.storage
    .from("videos")
    .upload(thumbnailPath, thumbnail, {
      contentType: thumbnail.type,
      upsert: false,
    });

  if (thumbnailError) {
    setLoading(false);
    setMessage("Thumbnail upload failed: " + thumbnailError.message);
    return;
  }

  const { data: thumbnailData } = supabase.storage
    .from("videos")
    .getPublicUrl(thumbnailPath);

  thumbnailUrl = thumbnailData.publicUrl;
}

    const filePath =
      `${userData.user.id}/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;

    const { error: uploadError } = await supabase.storage
      .from("videos")
      .upload(filePath, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      setLoading(false);
      setMessage("Upload failed: " + uploadError.message);
      return;
    }

    const { data: publicData } = supabase.storage
  .from("videos")
  .getPublicUrl(filePath);

    const durationSeconds = await new Promise<number>((resolve) => {
  const videoElement = document.createElement("video");

  videoElement.preload = "metadata";
  videoElement.onloadedmetadata = () => {
    resolve(
      Number.isFinite(videoElement.duration)
        ? Math.round(videoElement.duration)
        : 0
    );
    videoElement.src = "";
  };

  videoElement.onerror = () => resolve(0);
  videoElement.src = URL.createObjectURL(file);
});

const { error: dbError } = await supabase.from("videos").insert({
  title,
  description,
  category,
  video_url: publicData.publicUrl,
  thumbnail_url: thumbnailUrl,
  duration_seconds: durationSeconds,
});

    if (dbError) {
      await supabase.storage.from("videos").remove([filePath]);
      setLoading(false);
      setMessage("Could not save video details: " + dbError.message);
      return;
    }

    setLoading(false);
    setMessage("Video uploaded successfully!");
    setTitle("");
    setDescription("");
    setCategory("Other");
    setFile(null);
    e.currentTarget.reset();
  }

  return (
    <main className="min-h-screen bg-[#0b0718] p-6 text-white">
      <div className="mx-auto max-w-2xl">
        <button
          type="button"
          onClick={() => router.push("/admin")}
          className="mb-6 text-violet-300"
        >
          ← Back to Dashboard
        </button>

        <h1 className="text-3xl font-bold">Upload a Video</h1>
        <p className="mt-2 text-gray-400">
          Add a video to your VIDORA library.
        </p>

        <form
          onSubmit={handleUpload}
          className="mt-8 space-y-5 rounded-2xl border border-white/10 bg-white/5 p-6"
        >
          <div>
            <label className="mb-2 block">Video title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={150}
              className="w-full rounded-lg bg-white/10 p-3 outline-none"
              placeholder="Enter video title"
            />
          </div>

          <div>
            <label className="mb-2 block">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg bg-white/10 p-3 outline-none"
              rows={4}
              placeholder="Describe your video"
            />
          </div>

          <div>
            <label className="mb-2 block">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-lg bg-[#211735] p-3"
            >
              <option>Other</option>
              <option>MOM</option>
              <option>Bhabhi</option>
              <option>Affair</option>
              <option>outdoor</option>
              <option>Spy Cam</option>
              <option>Gangbang</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block">Thumbnail image (optional, max 5 MB)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setThumbnail(e.target.files?.[0] ?? null)}
              className="w-full rounded-lg bg-white/10 p-3"
            />
          </div>

          <div>
            <label className="mb-2 block">Video file (max 50 MB)</label>
            <input
              type="file"
              accept="video/*"
              required
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="w-full rounded-lg bg-white/10 p-3"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-violet-600 p-3 font-semibold disabled:opacity-50"
          >
            {loading ? "Uploading..." : "Upload Video"}
          </button>

          {message && (
            <p className="break-words text-sm text-violet-200">
              {message}
            </p>
          )}
        </form>
      </div>
    </main>
  );
}
