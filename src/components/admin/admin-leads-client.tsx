"use client";

import { useEffect, useState } from "react";

type Lead = {
  _id: string;
  name: string;
  phone: string;
  bookTitle: string;
  action: "read" | "download";
  createdAt: string;
};

export function AdminLeadsClient() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeads = async () => {
    try {
      const res = await fetch("/api/leads");
      if (res.ok) {
        setLeads(await res.json());
      }
    } catch (err) {
      console.error("Failed to fetch leads", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-3 py-8">
        <span className="w-2 h-2 rounded-full bg-saffron animate-pulse-soft" />
        <p className="text-ink/50 font-sans text-sm">Loading leads…</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl text-ink">Book Leads</h1>
          <p className="text-sm text-ink/55 font-sans mt-0.5">
            {leads.length} inquiry{leads.length !== 1 ? "ies" : ""} collected
          </p>
        </div>
      </div>

      <div className="glass-panel overflow-hidden border border-saffron/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-sans text-sm">
            <thead>
              <tr className="bg-saffron/5 border-b border-saffron/10">
                <th className="px-4 py-3 font-semibold text-ink/70">Date</th>
                <th className="px-4 py-3 font-semibold text-ink/70">Name</th>
                <th className="px-4 py-3 font-semibold text-ink/70">Phone</th>
                <th className="px-4 py-3 font-semibold text-ink/70">Book</th>
                <th className="px-4 py-3 font-semibold text-ink/70">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/5">
              {leads.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-ink/40">
                    No leads collected yet.
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr key={lead._id} className="hover:bg-saffron/3 transition-colors">
                    <td className="px-4 py-3 text-ink/60 whitespace-nowrap">
                      {new Date(lead.createdAt).toLocaleDateString()} {new Date(lead.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-4 py-3 font-medium text-ink">{lead.name}</td>
                    <td className="px-4 py-3 text-ink/80">{lead.phone}</td>
                    <td className="px-4 py-3 text-ink/80">{lead.bookTitle}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                        lead.action === "read" ? "bg-blue-50 text-blue-600 border border-blue-100" : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                      }`}>
                        {lead.action}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
