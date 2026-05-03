"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/contexts/language-context";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; phone: string }) => Promise<void>;
  bookTitle: string;
}

export function LeadFormModal({ isOpen, onClose, onSubmit, bookTitle }: Props) {
  const { tr } = useLanguage();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !phone.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    if (phone.length < 10) {
      setError("Please enter a valid phone number.");
      return;
    }

    setBusy(true);
    try {
      await onSubmit({ name, phone });
      onClose();
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md glass-panel p-6 md:p-8 shadow-2xl border border-saffron/20"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-ink/40 hover:text-ink transition-colors"
            >
              ✕
            </button>

            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-full bg-saffron/10 flex items-center justify-center text-saffron text-2xl mx-auto mb-3">
                📖
              </div>
              <h2 className="font-serif text-2xl text-ink mb-1">Information Request</h2>
              <p className="text-sm text-ink/60 font-sans">
                Please provide your details to access <strong>{bookTitle}</strong>.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink/80 mb-1 font-sans">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full rounded-xl border border-ink/15 bg-white/50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-saffron/30 font-sans"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ink/80 mb-1 font-sans">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 9876543210"
                  className="w-full rounded-xl border border-ink/15 bg-white/50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-saffron/30 font-sans"
                  required
                />
              </div>

              {error && (
                <p className="text-xs text-red-500 font-sans">{error}</p>
              )}

              <button
                type="submit"
                disabled={busy}
                className="w-full rounded-2xl bg-saffron text-white py-3.5 font-semibold font-sans
                  shadow-glow-sm hover:bg-saffron-dim disabled:opacity-50 active:scale-95 transition-all mt-2"
              >
                {busy ? "Processing..." : "Continue to Access"}
              </button>
            </form>

            <p className="text-[10px] text-ink/30 text-center mt-6 font-sans">
              Your information is safe with us and will only be used for spiritual guidance.
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
