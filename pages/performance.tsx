import { useEffect, useState } from "react";
import Link from "next/link";
import Loader from "./components/loader";
import LogoutButton from "./components/logoutButton";

interface Perf {
  project_id: number;
  name: string;
  total_logged_hours: number;
  budgeted_hours: number | null;
  budgeted_cost: number;
  actual_cost: number;
  cost_variance: number;
  cost_performance_index: number | null;
  status: string;
}

export default function Performance() {
  const [data, setData] = useState<Perf[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [filter, setFilter] = useState<string>("");

  useEffect(() => {
    fetch("/api/performance")
      .then(async (res) => {
        const body = await res.json().catch(() => null);
        if (!res.ok) throw new Error(body?.error || "Request failed");
        return body;
      })
      .then(setData)
      .catch((err) => setError(err.message));
  }, []);

  const filteredData = data?.filter((p) => {
    const matchesName = p.name.toLowerCase().includes(filter.toLowerCase());
    const matchesStatus = statusFilter === "" || p.status === statusFilter;
    return matchesName && matchesStatus;
  });

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Performance</h1>
      <Link href="/">
        <button>Back</button>
      </Link>
      <LogoutButton />

      <div style={{ marginTop: "20px", marginBottom: "10px", display: "flex" }}>
        <input
          type="text"
          placeholder="Search project..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{
            padding: "6px 12px",
            border: "1px solid #ccc",
            borderRadius: "4px",
            width: "250px",
          }}
        />

        <div style={{ marginTop: "10px", marginBottom: "10px" }}>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: "6px 12px",
              border: "1px solid #ccc",
              borderRadius: "4px",
              marginLeft: "10px",
            }}
          >
            <option value="">All statuses</option>
            <option value="Within budget">Within budget</option>
            <option value="Over budget">Over budget</option>
          </select>
        </div>
      </div>

      {error && <p style={{ color: "red" }}>Error: {error}</p>}
      {!data && !error && <Loader />}
      {filteredData && (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: "10px",
            fontSize: "14px",
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "#f0f0f0" }}>
              <th style={thStyle} title="Name of the project.">
                Project
              </th>
              <th
                style={thStyle}
                title="Project status regarding budget: 'Over budget' (exceeded) or 'Within budget'."
              >
                Status
              </th>
              <th
                style={thStyle}
                title="Estimated hours allocated as the budget for the project. If '—' appears, no hours were defined."
              >
                Budgeted Hours
              </th>
              <th
                style={thStyle}
                title="Hours that have already been worked and logged for the project."
              >
                Time Worked
              </th>
              <th
                style={thStyle}
                title="Difference between budgeted hours and time worked. Negative means overtime."
              >
                Overtime
              </th>
              <th
                style={thStyle}
                title="Estimated monetary budget for the project."
              >
                Budgeted Cost
              </th>
              <th
                style={thStyle}
                title="Actual cost incurred so far (how much has been spent)."
              >
                Actual Cost
              </th>
              <th
                style={thStyle}
                title="Difference between budgeted and actual cost. Negative means overspending, positive means savings."
              >
                Cost Variance
              </th>
              <th
                style={thStyle}
                title="Cost Performance Index. Calculated as: Budgeted Cost / Actual Cost. A value less than 1 indicates overspending."
              >
                CPI
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((p) => (
              <tr key={p.project_id}>
                <td style={tdStyle}>
                  <span
                    style={{
                      display: "inline-block",
                      width: "10px",
                      height: "10px",
                      borderRadius: "50%",
                      backgroundColor:
                        p.status === "Over budget" ? "red" : "green",
                      marginRight: "8px",
                    }}
                    title={
                      p.status === "Over budget"
                        ? "Over budget"
                        : "Within budget"
                    }
                  ></span>
                  {p.name}
                </td>
                <td style={tdStyle}>{p.status}</td>
                <td style={tdStyle}>{p.budgeted_hours ?? "—"}</td>
                <td style={tdStyle}>{p.total_logged_hours.toFixed(2)}</td>
                <td style={tdStyle}>
                  {p.budgeted_hours === null
                    ? "—"
                    : (p.budgeted_hours - p.total_logged_hours).toFixed(2)}
                </td>
                <td style={tdStyle}>${p.budgeted_cost.toFixed(2)}</td>
                <td style={tdStyle}>${p.actual_cost.toFixed(2)}</td>
                <td style={tdStyle}>${p.cost_variance.toFixed(2)}</td>
                <td style={tdStyle}>
                  {p.cost_performance_index?.toFixed(2) ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const thStyle = {
  border: "1px solid #ccc",
  padding: "8px",
  textAlign: "left" as const,
};

const tdStyle = {
  border: "1px solid #ccc",
  padding: "8px",
};
