"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatCurrency } from "@/lib/config";
import {
  ShieldCheck,
  Users,
  Trophy,
  AlertTriangle,
  Lock,
  EyeOff,
  CheckCircle,
  FileText,
  Disc3,
  TrendingUp,
  RefreshCw,
  Plus,
  Trash2,
  Check,
  X,
  MessageSquare,
} from "lucide-react";
import type { Listing, Category, Report, AdminAuditLog, PlatformStats } from "@/types";

interface AdminTestimonial {
  id: string;
  author_name: string;
  author_handle: string;
  author_initials: string;
  quote_text: string;
  date_label: string;
  post_url?: string;
  sort_order: number;
  is_active: number;
  created_at: string;
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<"listings" | "reports" | "audit" | "categories" | "testimonials">("listings");
  const [listings, setListings] = useState<Listing[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>([]);
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [testimonials, setTestimonials] = useState<AdminTestimonial[]>([]);
  const [loading, setLoading] = useState(true);

  // New testimonial form state
  const [newAuthorName, setNewAuthorName] = useState("");
  const [newAuthorHandle, setNewAuthorHandle] = useState("");
  const [newAuthorInitials, setNewAuthorInitials] = useState("");
  const [newDateLabel, setNewDateLabel] = useState("");
  const [newPostUrl, setNewPostUrl] = useState("");
  const [newSortOrder, setNewSortOrder] = useState("0");
  const [newQuoteText, setNewQuoteText] = useState("");
  const [submittingTesti, setSubmittingTesti] = useState(false);

  // Moderation action modal state
  const [actionListing, setActionListing] = useState<Listing | null>(null);
  const [actionStatus, setActionStatus] = useState<"active" | "hidden" | "suspended" | "removed">("active");
  const [actionReason, setActionReason] = useState("");
  const [submittingAction, setSubmittingAction] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [listRes, catRes, statRes, adminRes, testiRes] = await Promise.all([
        fetch("/api/v1/leaderboards/all-time?limit=100"),
        fetch("/api/v1/categories"),
        fetch("/api/v1/stats"),
        fetch("/api/v1/admin/reports"),
        fetch("/api/v1/testimonials?all=true"),
      ]);

      const [listData, catData, statData, adminData, testiData] = await Promise.all([
        listRes.json(),
        catRes.json(),
        statRes.json(),
        adminRes.json(),
        testiRes.json(),
      ]);

      if (listData.items) setListings(listData.items);
      if (catData.items) setCategories(catData.items);
      if (statData) setStats(statData);
      if (adminData.reports) setReports(adminData.reports);
      if (adminData.auditLogs) setAuditLogs(adminData.auditLogs);
      if (testiData.items) setTestimonials(testiData.items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleModerationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionListing || !actionReason.trim()) return;

    setSubmittingAction(true);
    try {
      const res = await fetch(`/api/v1/admin/listings/${actionListing.id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newStatus: actionStatus,
          reason: actionReason.trim(),
        }),
      });

      if (res.ok) {
        setActionListing(null);
        setActionReason("");
        fetchData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleAddTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAuthorName.trim() || !newQuoteText.trim()) return;

    setSubmittingTesti(true);
    try {
      const res = await fetch("/api/v1/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          authorName: newAuthorName.trim(),
          authorHandle: newAuthorHandle.trim() || `@${newAuthorName.trim().toLowerCase()}`,
          authorInitials: newAuthorInitials.trim() || newAuthorName.slice(0, 2).toUpperCase(),
          dateLabel: newDateLabel.trim() || "Recent",
          postUrl: newPostUrl.trim(),
          sortOrder: parseInt(newSortOrder, 10) || 0,
          quoteText: newQuoteText.trim(),
        }),
      });

      if (res.ok) {
        setNewAuthorName("");
        setNewAuthorHandle("");
        setNewAuthorInitials("");
        setNewDateLabel("");
        setNewPostUrl("");
        setNewQuoteText("");
        setNewSortOrder("0");
        fetchData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingTesti(false);
    }
  };

  const handleToggleTestiStatus = async (item: AdminTestimonial) => {
    try {
      const nextActive = item.is_active === 1 ? 0 : 1;
      const res = await fetch("/api/v1/testimonials", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: item.id,
          is_active: nextActive,
        }),
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTestimonial = async (id: string) => {
    if (!confirm("Are you sure you want to remove this testimonial?")) return;
    try {
      const res = await fetch(`/api/v1/testimonials?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-[var(--card-border)]">
        <div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] font-mono font-semibold">
            Superuser Control Panel
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-[var(--foreground)] mt-1">
            overcall.lol Platform Governance
          </h1>
        </div>

        <button
          onClick={fetchData}
          disabled={loading}
          className="px-3.5 py-2 rounded-xl bg-[var(--card-bg)] hover:bg-[var(--primary)]/10 border border-[var(--card-border)] text-[var(--text-muted)] hover:text-[var(--foreground)] text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Sync Dashboard</span>
        </button>
      </div>

      {/* KPI Overview Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-4">
            <span className="text-xs text-[var(--text-muted)] block">Active Listings</span>
            <span className="text-2xl font-black text-[var(--foreground)]">{stats.totalArtists}</span>
          </div>
          <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-4">
            <span className="text-xs text-[var(--text-muted)] block">Cumulative Volume</span>
            <span className="text-2xl font-black text-[var(--primary)]">
              {formatCurrency(stats.totalVolumeMinor)}
            </span>
          </div>
          <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-4">
            <span className="text-xs text-[var(--text-muted)] block">Today&apos;s Volume</span>
            <span className="text-2xl font-black text-[var(--secondary)]">
              {formatCurrency(stats.todayVolumeMinor)}
            </span>
          </div>
          <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-4">
            <span className="text-xs text-[var(--text-muted)] block">Reports Pending</span>
            <span className="text-2xl font-black text-red-500">
              {reports.filter((r) => r.status === "pending").length}
            </span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-[var(--card-border)] space-x-2 overflow-x-auto">
        {(["listings", "reports", "audit", "categories", "testimonials"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition border-b-2 cursor-pointer whitespace-nowrap ${
              activeTab === tab
                ? "border-[var(--primary)] text-[var(--primary)]"
                : "border-transparent text-[var(--text-muted)] hover:text-[var(--foreground)]"
            }`}
          >
            {tab === "testimonials" ? "#1 Testimonials" : tab}
          </button>
        ))}
      </div>

      {/* Tab: Listings Moderation */}
      {activeTab === "listings" && (
        <div className="bg-[var(--card-bg)] rounded-2xl border border-[var(--card-border)] overflow-hidden shadow-xl">
          <div className="divide-y divide-[var(--card-border)]">
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-[var(--primary)]/5 text-[11px] font-semibold uppercase text-[var(--text-muted)]">
              <div className="col-span-1">Rank</div>
              <div className="col-span-4">Item / URL</div>
              <div className="col-span-2">Category</div>
              <div className="col-span-2 text-right">Volume</div>
              <div className="col-span-1 text-center">Status</div>
              <div className="col-span-2 text-right">Action</div>
            </div>

            {listings.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-3.5 items-center hover:bg-[var(--primary)]/5 text-xs"
              >
                <div className="col-span-1 font-mono font-bold text-[var(--secondary)]">
                  #{item.rank || "—"}
                </div>
                <div className="col-span-4 min-w-0">
                  <div className="font-bold text-[var(--foreground)] truncate">{item.display_name}</div>
                  <div className="text-[11px] text-[var(--text-muted)] truncate">{item.canonical_identity}</div>
                </div>
                <div className="col-span-2 text-[var(--text-muted)]">{item.category_name}</div>
                <div className="col-span-2 text-right font-mono font-bold text-[var(--foreground)]">
                  {formatCurrency(item.total_paid_minor)}
                </div>
                <div className="col-span-1 text-center">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                      item.status === "active"
                        ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-300"
                        : item.status === "hidden"
                        ? "bg-yellow-500/20 text-yellow-600 dark:text-yellow-300"
                        : "bg-red-500/20 text-red-600 dark:text-red-300"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
                <div className="col-span-2 flex justify-end gap-1.5">
                  <button
                    onClick={() => {
                      setActionListing(item);
                      setActionStatus(item.status === "active" ? "hidden" : "active");
                    }}
                    className="px-2.5 py-1 rounded-lg bg-[var(--card-bg)] hover:bg-[var(--primary)]/10 border border-[var(--card-border)] text-[var(--foreground)] text-[11px] font-semibold transition cursor-pointer"
                  >
                    Moderate
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Reports */}
      {activeTab === "reports" && (
        <div className="bg-[var(--card-bg)] rounded-2xl border border-[var(--card-border)] overflow-hidden p-6 space-y-4">
          <h3 className="font-bold text-base text-[var(--foreground)]">Public Moderation Flags</h3>
          {reports.length === 0 ? (
            <p className="text-xs text-[var(--text-muted)] py-8 text-center">No reports filed yet.</p>
          ) : (
            <div className="space-y-3">
              {reports.map((rep) => (
                <div key={rep.id} className="p-4 rounded-xl bg-[var(--background)] border border-[var(--card-border)] space-y-1.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-red-500">{rep.reason}</span>
                    <span className="text-[10px] text-[var(--text-muted)]">{rep.created_at}</span>
                  </div>
                  <p className="text-[var(--foreground)]">{rep.description}</p>
                  <div className="text-[11px] text-[var(--text-muted)] pt-1">
                    Target Listing: <strong className="text-[var(--foreground)]">{rep.listing_name || rep.listing_id}</strong>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Administrative Audit Logs */}
      {activeTab === "audit" && (
        <div className="bg-[var(--card-bg)] rounded-2xl border border-[var(--card-border)] overflow-hidden p-6 space-y-4">
          <h3 className="font-bold text-base text-[var(--foreground)]">Immutable Administrative Audit Log</h3>
          {auditLogs.length === 0 ? (
            <p className="text-xs text-[var(--text-muted)] py-8 text-center">No administrative actions logged.</p>
          ) : (
            <div className="space-y-3">
              {auditLogs.map((log) => (
                <div key={log.id} className="p-4 rounded-xl bg-[var(--background)] border border-[var(--card-border)] space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="font-bold text-[var(--foreground)] capitalize">{log.action}</span>
                    <span className="text-[11px] text-[var(--text-muted)]">{log.created_at}</span>
                  </div>
                  <p className="text-[var(--text-muted)]">Reason: {log.reason}</p>
                  <p className="text-[10px] text-[var(--text-muted)] font-mono">Entity: {log.entity_id}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Categories */}
      {activeTab === "categories" && (
        <div className="bg-[var(--card-bg)] rounded-2xl border border-[var(--card-border)] overflow-hidden p-6 space-y-4">
          <h3 className="font-bold text-base text-[var(--foreground)]">Platform Taxonomy Categories</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {categories.map((cat) => (
              <div key={cat.id} className="p-3.5 bg-[var(--background)] rounded-xl border border-[var(--card-border)] flex justify-between items-center text-xs">
                <div>
                  <h4 className="font-bold text-[var(--foreground)]">{cat.name}</h4>
                  <span className="text-[10px] text-[var(--text-muted)] font-mono">{cat.slug}</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 text-[10px]">
                  Active
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: #1 Testimonials Backend Control */}
      {activeTab === "testimonials" && (
        <div className="space-y-6">
          {/* Add New Testimonial Card */}
          <div className="bg-[var(--card-bg)] rounded-2xl border border-[var(--card-border)] p-5 sm:p-6 space-y-4 shadow-sm">
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-4 h-4 text-[#FF5E1A]" />
              <h3 className="font-bold text-base text-[var(--foreground)]">
                Add New #1 Champion Testimonial
              </h3>
            </div>
            <p className="text-xs text-[var(--text-muted)]">
              This updates the live &ldquo;From the people who took #1&rdquo; section on the About page.
            </p>

            <form onSubmit={handleAddTestimonial} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-[var(--text-muted)] mb-1">Author Name *</label>
                  <input
                    type="text"
                    required
                    value={newAuthorName}
                    onChange={(e) => setNewAuthorName(e.target.value)}
                    placeholder="e.g. MakerThrive"
                    className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--card-border)] rounded-xl text-[var(--foreground)] outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[var(--text-muted)] mb-1">Author Handle</label>
                  <input
                    type="text"
                    value={newAuthorHandle}
                    onChange={(e) => setNewAuthorHandle(e.target.value)}
                    placeholder="e.g. @MakerThrive"
                    className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--card-border)] rounded-xl text-[var(--foreground)] outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[var(--text-muted)] mb-1">Initials</label>
                  <input
                    type="text"
                    maxLength={3}
                    value={newAuthorInitials}
                    onChange={(e) => setNewAuthorInitials(e.target.value)}
                    placeholder="e.g. MT"
                    className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--card-border)] rounded-xl text-[var(--foreground)] outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[var(--text-muted)] mb-1">Date Label / Sort</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newDateLabel}
                      onChange={(e) => setNewDateLabel(e.target.value)}
                      placeholder="e.g. Aug 24"
                      className="w-2/3 px-3 py-2 bg-[var(--background)] border border-[var(--card-border)] rounded-xl text-[var(--foreground)] outline-none"
                    />
                    <input
                      type="number"
                      value={newSortOrder}
                      onChange={(e) => setNewSortOrder(e.target.value)}
                      placeholder="Order"
                      className="w-1/3 px-2 py-2 bg-[var(--background)] border border-[var(--card-border)] rounded-xl text-[var(--foreground)] outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[var(--text-muted)] text-xs mb-1">
                  Original X Post Link / URL (Optional)
                </label>
                <input
                  type="url"
                  value={newPostUrl}
                  onChange={(e) => setNewPostUrl(e.target.value)}
                  placeholder="https://x.com/username/status/... (default links to user profile)"
                  className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--card-border)] rounded-xl text-[var(--foreground)] text-xs outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[var(--text-muted)] text-xs mb-1">Quote Text *</label>
                <textarea
                  required
                  rows={3}
                  value={newQuoteText}
                  onChange={(e) => setNewQuoteText(e.target.value)}
                  placeholder="Paste feedback quote..."
                  className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--card-border)] rounded-xl text-[var(--foreground)] text-xs outline-none"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submittingTesti}
                  className="px-4 py-2 rounded-xl bg-[#FF5E1A] hover:opacity-90 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{submittingTesti ? "Saving..." : "Save Testimonial"}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Testimonials List */}
          <div className="bg-[var(--card-bg)] rounded-2xl border border-[var(--card-border)] overflow-hidden shadow-xs">
            <div className="p-4 sm:p-5 border-b border-[var(--card-border)] flex items-center justify-between">
              <h3 className="font-bold text-sm text-[var(--foreground)]">
                Active Testimonials ({testimonials.length})
              </h3>
              <span className="text-xs text-[var(--text-muted)]">
                Click status badge to toggle visibility
              </span>
            </div>

            <div className="divide-y divide-[var(--card-border)]">
              {testimonials.map((t) => (
                <div key={t.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="w-6 h-6 rounded-full bg-orange-500/20 text-[#FF5E1A] font-bold text-[10px] flex items-center justify-center shrink-0">
                        {t.author_initials}
                      </span>
                      <span className="font-bold text-[var(--foreground)]">{t.author_name}</span>
                      <span className="text-[var(--text-dim)]">{t.author_handle} · {t.date_label}</span>
                      <span className="text-[10px] text-[var(--text-dim)] font-mono">Order: {t.sort_order}</span>
                    </div>
                    <p className="text-[var(--text-muted)] whitespace-pre-line text-xs pl-8">
                      {t.quote_text}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0 pl-8 sm:pl-0">
                    <button
                      onClick={() => handleToggleTestiStatus(t)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition cursor-pointer flex items-center gap-1 ${
                        t.is_active === 1
                          ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 hover:bg-emerald-500/30"
                          : "bg-zinc-500/20 text-zinc-500 hover:bg-zinc-500/30"
                      }`}
                    >
                      {t.is_active === 1 ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                      <span>{t.is_active === 1 ? "Visible" : "Hidden"}</span>
                    </button>

                    <button
                      onClick={() => handleDeleteTestimonial(t.id)}
                      className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-500 transition cursor-pointer"
                      title="Delete testimonial"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Moderation Modal */}
      {actionListing && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[var(--card-bg)] border border-[var(--card-border)] rounded-3xl p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-[var(--foreground)]">Moderate Listing</h3>
            <p className="text-xs text-[var(--text-muted)]">
              Target: <strong className="text-[var(--foreground)]">{actionListing.display_name}</strong>
            </p>

            <form onSubmit={handleModerationSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase mb-1">
                  Change Status
                </label>
                <select
                  value={actionStatus}
                  onChange={(e) => setActionStatus(e.target.value as "active" | "hidden" | "suspended" | "removed")}
                  className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--card-border)] rounded-xl text-[var(--foreground)] text-xs outline-none cursor-pointer"
                >
                  <option value="active">Active (Visible)</option>
                  <option value="hidden">Hidden (Removed from board)</option>
                  <option value="suspended">Suspended</option>
                  <option value="removed">Permanently Removed</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase mb-1">
                  Mandatory Audit Reason
                </label>
                <textarea
                  required
                  rows={3}
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  placeholder="State the audit rationale for this change..."
                  className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--card-border)] rounded-xl text-[var(--foreground)] text-xs outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActionListing(null)}
                  className="flex-1 py-2 rounded-xl bg-[var(--background)] hover:bg-[var(--primary)]/10 border border-[var(--card-border)] text-[var(--text-muted)] text-xs font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAction}
                  className="flex-1 py-2 rounded-xl bg-[var(--primary)] hover:opacity-90 text-white text-xs font-bold transition cursor-pointer"
                >
                  {submittingAction ? "Applying..." : "Confirm Update"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
