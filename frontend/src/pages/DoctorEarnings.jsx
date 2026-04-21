import React, { useEffect, useState, useMemo, useCallback } from "react";
import DoctorLayout from "../layouts/DoctorLayout";

const API_URL = import.meta.env.VITE_API_URL;

// ── Bar Chart ─────────────────────────────────────────────────────────────────
function EarningsChart({ data }) {
  const max    = data.length ? Math.max(...data.map(d => d.amount)) : 800;
  const chartH = 180;

  if (!data.length) {
    return (
      <div style={boxStyle}>
        <p style={{ color: "#9ca3af", fontSize: 13 }}>No chart data available</p>
      </div>
    );
  }

  return (
    <div style={boxStyle}>
      <p style={{ fontWeight: 600, fontSize: 14, marginBottom: 16 }}>
        Earnings by Month
      </p>
      <div style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
        <div style={yAxisStyle}>
          {[0,1,2,3,4,5,6,7,8].map(i => (
            <span key={i}>{Math.round((max / 8) * i)}</span>
          ))}
        </div>
        <div style={{ flex: 1, position: "relative" }}>
          {[0,1,2,3,4,5,6,7,8].map(i => (
            <div key={i} style={{
              position:  "absolute",
              left: 0, right: 0,
              bottom:    20 + (i / 8) * (chartH - 20),
              borderTop: "1px solid #f0f0f0",
            }} />
          ))}
          <div style={{ display: "flex", alignItems: "flex-end", height: chartH, gap: 8, paddingBottom: 20 }}>
            {data.map(d => {
              const barH = ((d.amount / (max * 1.1)) * (chartH - 20));
              return (
                <div key={d.month} style={{ flex: 1, textAlign: "center" }}>
                  <div style={{
                    width:      "100%",
                    height:     barH,
                    background: "#6b9fe4",
                    borderRadius: "3px 3px 0 0",
                  }} />
                  <span style={{ fontSize: 10, color: "#9ca3af" }}>{d.month}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 6 }}>
        Earnings include only paid appointments.
      </p>
    </div>
  );
}

// ── Helper ────────────────────────────────────────────────────────────────────
function buildMonthlyData(earnings) {
  const map = {};
  earnings.forEach(e => {
    const d = new Date(e.date);
    if (isNaN(d)) return;
    const key   = d.toLocaleString("default", { month: "long", year: "numeric" });
    const short = d.toLocaleString("default", { month: "short" });
    map[key] = {
      month:  short,
      amount: (map[key]?.amount || 0) + (e.amount || 0),
    };
  });
  return Object.values(map);
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function DoctorEarnings() {
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [earnings, setEarnings] = useState([]);
  const [dateRange, setDateRange] = useState({ from: "", to: "" });

  const getCurrentMonthLabel = () => {
    const now   = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end   = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const fmt   = (d) => d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    return `${fmt(start)} - ${fmt(end)}`;
  };

  const [currentPeriodLabel] = useState(getCurrentMonthLabel());

  const fetchEarnings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const res   = await fetch(`${API_URL}/api/doctor/earnings`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const text = await res.text();
      let data;
      try { data = JSON.parse(text); }
      catch { throw new Error("Invalid response from server"); }

      if (!res.ok || !data.success) {
        throw new Error(data?.message || "Failed to fetch earnings");
      }

      setEarnings(data.data || []);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchEarnings(); }, [fetchEarnings]);

  const total = useMemo(() =>
    earnings.reduce((sum, e) => sum + (e.amount || 0), 0),
  [earnings]);

  const filteredData = useMemo(() => {
    if (!dateRange.from && !dateRange.to) return earnings;
    return earnings.filter(e => {
      const d = new Date(e.date);
      const from = dateRange.from ? new Date(dateRange.from) : null;
      const to   = dateRange.to   ? new Date(dateRange.to)   : null;
      if (from && d < from) return false;
      if (to   && d > to)   return false;
      return true;
    });
  }, [earnings, dateRange]);

  const monthlyChartData = useMemo(() => buildMonthlyData(earnings), [earnings]);

  return (
    <DoctorLayout>
      <div style={{ padding: "32px 36px", background: "#f9fafb", minHeight: "100vh" }}>

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 26, fontWeight: 700 }}>Earnings</h1>
          <p style={{ fontSize: 13, color: "#9ca3af" }}>
            Track your earnings from paid appointments.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div style={errorStyle}>
            {error}
            <button onClick={fetchEarnings} style={retryBtn}>Retry</button>
          </div>
        )}

        {/* Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 28 }}>
          <div
            style={cardStyle}
            onMouseEnter={e => e.currentTarget.style.transform = "translateY(-4px)"}
            onMouseLeave={e => e.currentTarget.style.transform = "translateY(0px)"}
          >
            <p style={{ opacity: 0.8 }}>Total Earnings (Paid)</p>
            <p style={{ opacity: 0.6, fontSize: 12 }}>{currentPeriodLabel}</p>
            {loading ? (
              <div style={skeleton} />
            ) : (
              <h2 style={{ fontSize: 34, marginTop: 10 }}>
                Rs.{total.toLocaleString()}.00
              </h2>
            )}
            <p style={{ opacity: 0.7, fontSize: 12, marginTop: 8 }}>
              {earnings.length} paid appointment{earnings.length !== 1 ? "s" : ""}
            </p>
          </div>

          <EarningsChart data={monthlyChartData} />
        </div>

        {/* Filters */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <label style={{ fontSize: 13, color: "#6b7280" }}>From</label>
            <input
              type="date"
              style={inputStyle}
              value={dateRange.from}
              onChange={e => setDateRange(r => ({ ...r, from: e.target.value }))}
            />
            <label style={{ fontSize: 13, color: "#6b7280" }}>To</label>
            <input
              type="date"
              style={inputStyle}
              value={dateRange.to}
              onChange={e => setDateRange(r => ({ ...r, to: e.target.value }))}
            />
            {(dateRange.from || dateRange.to) && (
              <button
                onClick={() => setDateRange({ from: "", to: "" })}
                style={{ ...inputStyle, cursor: "pointer", background: "#f3f4f6", border: "none" }}
              >
                Clear
              </button>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{
              border: "1px solid #d1d5db", borderRadius: 8, padding: "6px 14px",
              fontSize: 13, color: "#374151", background: "#fff",
            }}>
              {currentPeriodLabel}
            </div>
          </div>
        </div>

        {/* Table */}
        <div style={boxStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2 style={{ fontWeight: 600, fontSize: 15 }}>Earnings by Appointment</h2>
            <span style={{ fontSize: 12, color: "#9ca3af" }}>
              {filteredData.length} record{filteredData.length !== 1 ? "s" : ""}
            </span>
          </div>

          {loading ? (
            <p style={{ color: "#9ca3af", fontSize: 13, textAlign: "center", padding: "24px 0" }}>
              Loading...
            </p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #f0f0f0" }}>
                    {["Appointment No.", "Patient Name", "Date Paid", "Amount", "Status"].map(h => (
                      <th key={h} style={{
                        padding: "10px 12px", textAlign: "left", fontSize: 11,
                        color: "#9ca3af", fontWeight: 500,
                        textTransform: "uppercase", letterSpacing: 0.4,
                      }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((e, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #f9fafb" }}>
                      <td style={{ padding: "13px 12px", color: "#1d6ef6", fontWeight: 500 }}>
                        #{e.appointmentId}
                      </td>
                      <td style={{ padding: "13px 12px", color: "#111827" }}>
                        {e.patientName}
                      </td>
                      <td style={{ padding: "13px 12px", color: "#374151" }}>
                        {e.date}
                      </td>
                      <td style={{ padding: "13px 12px", color: "#111827", fontWeight: 500 }}>
                        Rs.{(e.amount || 0).toLocaleString()}.00
                      </td>
                      <td style={{ padding: "13px 12px" }}>
                        <span style={{
                          background: "#dcfce7", color: "#16a34a",
                          borderRadius: 20, padding: "3px 12px",
                          fontSize: 12, fontWeight: 600,
                        }}>
                          Paid
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredData.length === 0 && (
                <p style={{ textAlign: "center", color: "#9ca3af", padding: "28px 0", fontSize: 13 }}>
                  {earnings.length === 0
                    ? "No paid appointments yet."
                    : "No earnings found for this date range."}
                </p>
              )}
            </div>
          )}
        </div>

      </div>
    </DoctorLayout>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const boxStyle = {
  background:   "#fff",
  border:       "1px solid #e5e7eb",
  borderRadius: 12,
  padding:      "20px 24px",
};

const cardStyle = {
  ...boxStyle,
  background:  "#1d6ef6",
  color:       "#fff",
  transition:  "all 0.2s ease",
  cursor:      "pointer",
};

const inputStyle = {
  border:       "1px solid #d1d5db",
  borderRadius: 8,
  padding:      "7px 12px",
  fontSize:     13,
};

const errorStyle = {
  background:   "#fef2f2",
  padding:      10,
  borderRadius: 8,
  color:        "#dc2626",
  marginBottom: 10,
};

const retryBtn = {
  marginLeft: 10,
  color:      "#1d6ef6",
  background: "none",
  border:     "none",
  cursor:     "pointer",
};

const skeleton = {
  width:        150,
  height:       30,
  background:   "rgba(255,255,255,0.3)",
  borderRadius: 6,
  marginTop:    10,
};

const yAxisStyle = {
  display:        "flex",
  flexDirection:  "column-reverse",
  justifyContent: "space-between",
  height:         180,
  fontSize:       10,
  color:          "#9ca3af",
};