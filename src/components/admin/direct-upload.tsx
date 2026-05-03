"use client";

import { useState, useRef } from "react";

interface Props {
  folder: "audio" | "books" | "covers";
  onUploadComplete: (url: string) => void;
  label?: string;
  accept?: string;
}

export function DirectUpload({ folder, onUploadComplete, label = "Upload File", accept }: Props) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setProgress(10);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    try {
      setProgress(30);
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      setProgress(100);
      onUploadComplete(data.url);
      
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      alert("Upload failed. Please try again.");
    } finally {
      setTimeout(() => {
        setUploading(false);
        setProgress(0);
      }, 1000);
    }
  };

  return (
    <div className="relative">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleUpload}
        accept={accept}
        className="hidden"
      />
      <button
        type="button"
        disabled={uploading}
        onClick={() => fileInputRef.current?.click()}
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-sans transition-all
          ${uploading 
            ? "bg-ink/5 border-ink/10 text-ink/40 cursor-not-allowed" 
            : "bg-white hover:bg-saffron/5 border-ink/15 text-ink/70 hover:border-saffron/30 shadow-sm"
          }`}
      >
        {uploading ? (
          <>
            <span className="w-3 h-3 rounded-full border-2 border-saffron/30 border-t-saffron animate-spin" />
            Uploading ({progress}%)
          </>
        ) : (
          <>
            <span className="text-sm">📁</span>
            {label}
          </>
        )}
      </button>
    </div>
  );
}
