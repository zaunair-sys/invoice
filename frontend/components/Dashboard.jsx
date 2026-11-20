"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { dashboardStyles } from "@/assets/dummyStyles";
import { useAuth } from "@/context/AuthContext";
import KpiCard from "@/components/KpiCard";
import StatusBadge from "@/components/StatusBadge";
import { EyeIcon, FileTextIcon } from "lucide-react";

const API_BASE_URL = "http://localhost:4000";

function normalizeClient(raw) {
  if (!raw) return { name: "", email: "", address: "", phone: "" };
  if (typeof raw === "string")
    return { name: raw, email: "", address: "", phone: "" };
  if (typeof raw === "object") {
    return {
      name: raw.name ?? raw.company ?? raw.client ?? "",
      email: raw.email ?? raw.emailAddress ?? "",
      address: raw.address ?? "",
      phone: raw.phone ?? raw.contact ?? "",
    };
  }
  return { name: "", email: "", address: "", phone: "" };
}

function currencyFmt(amount = 0, currency = "USD") {
  try {
    const n = Number(amount || 0);
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(n);
  } catch {
    return `${currency} ${amount}`;
  }
}

function capitalize(s) {
  if (!s) return s;
  return String(s).charAt(0).toUpperCase() + String(s).slice(1);
}

function formatDate(dateInput) {
  if (!dateInput) return "—";
  const d =
    dateInput instanceof Date ? dateInput : new Date(String(dateInput));
  if (Number.isNaN(d.getTime())) return "—";
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${mm}/${dd}/${yyyy}`;
}

const Dashboard = () => {
  const router = useRouter();
  const { getToken, isSignedIn } = useAuth();

  const obtainToken = useCallback(async () => {
    if (typeof getToken !== "function") return null;
    try {
      let token = await getToken({ template: "default" }).catch(() => null);
      if (!token) {
        token = await getToken({ forceRefresh: true }).catch(() => null);
      }
      return token;
    } catch {
      return null;
    }
  }, [getToken]);

  const [storedInvoices, setStoredInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [businessProfile, setBusinessProfile] = useState(null);

  const fetchInvoices = useCallback(async () => {
    try {
      const token = await obtainToken();
      setLoading(true);
      setError(null);
      const headers = { Accept: "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE_URL}/api/invoices`, {
        method: "GET",
        headers,
      });

      const json = await res.json().catch(() => null);

      if (res.status === 401) {
        setError("Unauthorized. Please sign in.");
        setStoredInvoices([]);
        return;
      }

      if (!res.ok) {
        throw new Error(json?.message || `Failed (${res.status})`);
      }

      const raw = json?.data || [];

      const mapped = (Array.isArray(raw) ? raw : []).map((inv) => {
        const amountVal = Number(inv?.total ?? inv?.amount ?? 0);
        const currency = (inv?.currency || "USD").toUpperCase();

        return {
          ...inv,
          id: inv?.invoiceNumber || inv?._id || String(inv?._id || ""),
          client: normalizeClient(inv?.client),
          amount: amountVal,
          currency,
          status:
            typeof inv?.status === "string"
              ? capitalize(inv.status)
              : inv?.status || "Draft",
        };
      });

      setStoredInvoices(mapped);
    } catch (err) {
      console.error("Failed to fetch invoices:", err);
      setError(err?.message || "Failed to load invoices");
      setStoredInvoices([]);
    } finally {
      setLoading(false);
    }
  }, [obtainToken]);

  const fetchBusinessProfile = useCallback(async () => {
    try {
      const token = await obtainToken();
      if (!token) return;

      const res = await fetch(`${API_BASE_URL}/api/businessProfile/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!res.ok) return;

      const json = await res.json().catch(() => null);
      if (json?.data) setBusinessProfile(json.data);
    } catch (err) {
      console.warn("Failed to fetch business profile:", err);
    }
  }, [obtainToken]);

  useEffect(() => {
    let active = true;

    async function load() {
      if (!active) return;
      await fetchInvoices();
      if (!active) return;
      await fetchBusinessProfile();
    }

    load();

    function onStorage(e) {
      if (e.key === "invoices_v1") load();
    }

    window.addEventListener("storage", onStorage);
    return () => {
      active = false;
      window.removeEventListener("storage", onStorage);
    };
  }, [fetchInvoices, fetchBusinessProfile, isSignedIn]);

  const kpis = useMemo(() => {
    const totalInvoices = storedInvoices.length;
    const paidInvoices = storedInvoices.filter((inv) => inv.status === "Paid");
    const totalPaid = paidInvoices.reduce(
      (sum, inv) => sum + (inv.amount || 0),
      0
    );
    const totalUnpaid = storedInvoices
      .filter((inv) => inv.status !== "Paid")
      .reduce((sum, inv) => sum + (inv.amount || 0), 0);
    const paidCount = paidInvoices.length;
    const paidPercentage =
      totalInvoices > 0 ? (paidCount / totalInvoices) * 100 : 0;

    return { totalInvoices, totalPaid, totalUnpaid, paidCount, paidPercentage };
  }, [storedInvoices]);

  const recent = useMemo(() => [...storedInvoices].slice(0, 5), [storedInvoices]);

  function getClientName(inv) {
    return inv?.client?.name || "Unknown";
  }

  function getClientInitial(inv) {
    const name = getClientName(inv);
    return name ? name.charAt(0).toUpperCase() : "?";
  }

  function openInvoice(inv) {
    if (!inv?.id) return;
    router.push(`/app/invoices/${inv.id}`);
  }

  return (
    <div className={dashboardStyles.pageContainer} data-no-animate>
      <div className={dashboardStyles.headerContainer}>
        <div>
          <h1 className={dashboardStyles.headerTitle}>Dashboard Overview</h1>
          <p className={dashboardStyles.headerSubtitle}>
            Track your invoicing performance and business insights
          </p>
        </div>
      </div>

      {loading && (
        <div className="pti-card pti-card-pad mb-6" role="status" aria-live="polite">
          <div className="pti-skeleton h-5 w-40 mb-3" />
          <div className="pti-skeleton h-3 w-72" />
        </div>
      )}

      {!loading && error && (
        <div className="pti-alert pti-alert--error mb-6" role="alert">
          <div className="flex-1">Error: {error}</div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={fetchInvoices}
              className="pti-btn pti-btn-secondary pti-btn-sm"
             
            >
              Retry
            </button>
            {String(error).toLowerCase().includes("unauthorized") && (
              <button
                type="button"
                onClick={() => router.push("/login")}
                className="pti-btn pti-btn-primary pti-btn-sm"
               
              >
                Sign in
              </button>
            )}
          </div>
        </div>
      )}

      <div className={dashboardStyles.kpiGrid}>
        <KpiCard
          title="Total Invoices"
          value={kpis.totalInvoices}
          hint="Active invoices"
          iconType="document"
          trend={8.5}
        />
        <KpiCard
          title="Total Paid"
          value={currencyFmt(kpis.totalPaid, "USD")}
          hint="Received Amount"
          iconType="revenue"
          trend={12.2}
        />
        <KpiCard
          title="Total Unpaid"
          value={currencyFmt(kpis.totalUnpaid, "USD")}
          hint="Outstanding Balance"
          iconType="clock"
          trend={-3.1}
        />
      </div>

      <div className={dashboardStyles.mainGrid}>
        <div className={dashboardStyles.sidebarColumn}>
          <div
            className={dashboardStyles.quickStatsCard}
           
          >
            <h3 className={dashboardStyles.quickStatsTitle}>Quick Stats</h3>
            <div className="space-y-3">
              <div className={dashboardStyles.quickStatsRow}>
                <span className={dashboardStyles.quickStatsLabel}>Paid Rate</span>
                <span className={dashboardStyles.quickStatsValue}>
                  <span>
                    {kpis.totalInvoices > 0
                      ? ((kpis.paidCount / kpis.totalInvoices) * 100).toFixed(1)
                      : "0.0"}
                  </span>{" "}
                  %
                </span>
              </div>
              <div className={dashboardStyles.quickStatsRow}>
                <span className={dashboardStyles.quickStatsLabel}>
                  Avg. Invoice
                </span>
                <span className={dashboardStyles.quickStatsValue}>
                  {currencyFmt(
                    kpis.totalInvoices > 0
                      ? (kpis.totalPaid + kpis.totalUnpaid) / kpis.totalInvoices
                      : 0,
                    "USD"
                  )}
                </span>
              </div>
              <div className={dashboardStyles.quickStatsRow}>
                <span className={dashboardStyles.quickStatsLabel}>
                  Collection Eff.
                </span>
                <span className={dashboardStyles.quickStatsValue}>
                  <span>
                    {kpis.paidPercentage.toFixed(1)}
                  </span>
                  %
                </span>
              </div>
            </div>
          </div>

          <div className={dashboardStyles.cardContainer}>
            <div>
              <h3 className={dashboardStyles.quickStatsTitle}>Quick Actions</h3>
              <div className={dashboardStyles.quickActionsContainer}>
                <button
                  type="button"
                  onClick={() => router.push("/app/select-template")}
                  className={`${dashboardStyles.quickActionButton} ${dashboardStyles.quickActionBlue}`}
                 
                >
                  <span
                    className={`${dashboardStyles.quickActionIconContainer} ${dashboardStyles.quickActionIconBlue}`}
                  >
                    <svg
                      className="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      aria-hidden="true"
                    >
                      <path d="M12 5v14m-7-7h14" />
                    </svg>
                  </span>
                  <span className={dashboardStyles.quickActionText}>
                    Create Invoice
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => router.push("/app/invoices")}
                  className={`${dashboardStyles.quickActionButton} ${dashboardStyles.quickActionGray}`}
                 
                >
                  <span
                    className={`${dashboardStyles.quickActionIconContainer} ${dashboardStyles.quickActionIconGray}`}
                  >
                    <FileTextIcon className="w-4 h-4" aria-hidden="true" />
                  </span>
                  <span className={dashboardStyles.quickActionText}>
                    View All Invoices
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => router.push("/app/business")}
                  className={`${dashboardStyles.quickActionButton} ${dashboardStyles.quickActionGray}`}
                 
                >
                  <span
                    className={`${dashboardStyles.quickActionIconContainer} ${dashboardStyles.quickActionIconGray}`}
                  >
                    <svg
                      className="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      aria-hidden="true"
                    >
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </span>
                  <span className={dashboardStyles.quickActionText}>
                    Business Profile
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className={dashboardStyles.contentColumn}>
          <div
            className={dashboardStyles.cardContainerOverflow}
           
          >
            <div className={dashboardStyles.tableHeader}>
              <div className={dashboardStyles.tableHeaderContent}>
                <div>
                  <h3 className={dashboardStyles.tableTitle}>Recent Invoices</h3>
                  <p className={dashboardStyles.tableSubtitle}>
                    Latest 5 invoices from your account
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => router.push("/app/invoices")}
                  className={dashboardStyles.tableActionButton}
                 
                >
                  View all
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <path d="M5 12h14m-7-7l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>

            <div className={dashboardStyles.tableContainer}>
              <table className={dashboardStyles.table}>
                <thead>
                  <tr className={dashboardStyles.tableHead}>
                    <th className={dashboardStyles.tableHeaderCell} scope="col">
                      Client & ID
                    </th>
                    <th className={dashboardStyles.tableHeaderCell} scope="col">
                      Amount
                    </th>
                    <th className={dashboardStyles.tableHeaderCell} scope="col">
                      Status
                    </th>
                    <th className={dashboardStyles.tableHeaderCell} scope="col">
                      Due Date
                    </th>
                    <th
                      className={`${dashboardStyles.tableHeaderCell} ${dashboardStyles.tableHeaderCellRight}`}
                      scope="col"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className={dashboardStyles.tableBody}>
                  {recent.map((inv) => {
                    const clientName = getClientName(inv);
                    const clientInitial = getClientInitial(inv);

                    return (
                      <tr
                        key={inv.id}
                        className={dashboardStyles.tableRow}
                        onClick={() => openInvoice(inv)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") openInvoice(inv);
                        }}
                        tabIndex={0}
                        aria-label={`Open invoice ${inv.id} for ${clientName}`}
                      >
                        <td className={dashboardStyles.tableCell}>
                          <div className="flex items-center gap-3">
                            <div className={dashboardStyles.clientAvatar}>
                              {clientInitial}
                            </div>
                            <div>
                              <div className={dashboardStyles.clientInfo}>
                                {clientName}
                              </div>
                              <div className={dashboardStyles.clientSubInfo}>
                                {inv.id}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className={dashboardStyles.tableCell}>
                          <div className={dashboardStyles.amountCell}>
                            {currencyFmt(inv.amount, inv.currency)}
                          </div>
                        </td>
                        <td className={dashboardStyles.tableCell}>
                          <StatusBadge
                            status={inv.status}
                            size="default"
                            showIcon
                          />
                        </td>
                        <td className={dashboardStyles.tableCell}>
                          <div className={dashboardStyles.dateCell}>
                            {inv.dueDate ? formatDate(inv.dueDate) : "-"}
                          </div>
                        </td>
                        <td className={dashboardStyles.tableCell}>
                          <div className="text-right">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                openInvoice(inv);
                              }}
                              className={dashboardStyles.actionButton}
                              aria-label={`View invoice ${inv.id}`}
                            >
                              <EyeIcon className="w-4 h-4" aria-hidden="true" />
                              View
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {recent.length === 0 && !loading && (
                    <tr>
                      <td colSpan={5} className={dashboardStyles.emptyState}>
                        <div className={dashboardStyles.emptyStateText}>
                          <FileTextIcon
                            className={dashboardStyles.emptyStateIcon}
                            aria-hidden="true"
                          />
                          <div className="pti-empty-title">No invoice yet</div>
                          <p className="pti-empty-text">
                            Create your first invoice to start tracking payments.
                          </p>
                          <button
                            type="button"
                            onClick={() => router.push("/app/select-template")}
                            className={dashboardStyles.emptyStateAction}
                           
                          >
                            Create your first Invoice
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
