import { useEffect, useState } from "react";
import Link from "next/link";
import Loader from "./components/loader";
import LogoutButton from "./components/logoutButton";
import { formatDuration } from "../lib/time";

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

interface ProjectOption {
  id: number;
  name: string;
}

export default function Performance() {
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [selectedId, setSelectedId] = useState<number | "">("");
  const [data, setData] = useState<Perf | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/projects")
      .then(async (res) => {
        const body = await res.json().catch(() => null);
        if (!res.ok) throw new Error(body?.error || "Request failed");
        return body as ProjectOption[];
      })
      .then(setProjects)
      .catch((err) => setError(err.message));
  }, []);

  const loadPerformance = (id: number) => {
    setLoading(true);
    setData(null);
    fetch(`/api/performance/${id}`)
      .then(async (res) => {
        const body = await res.json().catch(() => null);
        if (!res.ok) throw new Error(body?.error || "Request failed");
        return body as Perf;
      })
      .then((perf) => {
        setData(perf);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedId(value ? Number(value) : "");
    if (value) {
      loadPerformance(Number(value));
    } else {
      setData(null);
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Performance</h1>
      <Link href="/">
        <button>Back</button>
      </Link>
      <LogoutButton />

      <div style={{ marginTop: "20px", marginBottom: "10px" }}>
        <select
          value={selectedId}
          onChange={handleSelect}
          style={{
            padding: "6px 12px",
            border: "1px solid #ccc",
            borderRadius: "4px",
            minWidth: "250px",
          }}
        >
          <option value="">Select project</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {error && <p style={{ color: "red" }}>Error: {error}</p>}
      {loading && <Loader />}
      {data && !loading && (
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
              <th style={thStyle}>Project</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Budgeted Hours</th>
              <th style={thStyle}>Time Worked</th>
              <th style={thStyle}>Overtime</th>
              <th style={thStyle}>Budgeted Cost</th>
              <th style={thStyle}>Actual Cost</th>
              <th style={thStyle}>Cost Variance</th>
              <th style={thStyle}>CPI</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={tdStyle}>{data.name}</td>
              <td style={tdStyle}>{data.status}</td>
              <td style={tdStyle}>{data.budgeted_hours ?? "—"}</td>
              <td style={tdStyle}>{formatDuration(data.total_logged_hours * 3600)}</td>
              <td style={tdStyle}>
                {data.budgeted_hours === null
                  ? "—"
                  : formatDuration((data.budgeted_hours - data.total_logged_hours) * 3600)}
              </td>
              <td style={tdStyle}>${data.budgeted_cost.toFixed(2)}</td>
              <td style={tdStyle}>${data.actual_cost.toFixed(2)}</td>
              <td style={tdStyle}>${data.cost_variance.toFixed(2)}</td>
              <td style={tdStyle}>{data.cost_performance_index?.toFixed(2) ?? "—"}</td>
            </tr>
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
