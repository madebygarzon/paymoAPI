import { useEffect, useState } from "react";
import Link from "next/link";
import Loader from "./components/loader";
import LogoutButton from "./components/logoutButton";
import { formatDuration } from "../lib/time";

interface PerfAPI {
  project_id: number;
  name: string;
  total_logged_hours: number;      // 780.33
  budgeted_hours: number | null;   // 600
  budgeted_cost: number;           // 70000
  /* El resto llega, pero lo ignoraremos: */
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
  const [data, setData] = useState<PerfAPI | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ─────────────── Cargar lista de proyectos una vez ─────────────── */
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

  /* ─────────────── Cargar métricas brutas del proyecto ────────────── */
  const loadPerformance = (id: number) => {
    setLoading(true);
    setData(null);

    fetch(`/api/performance/${id}`)
      .then(async (res) => {
        const body = await res.json().catch(() => null);
        if (!res.ok) throw new Error(body?.error || "Request failed");
        return body as PerfAPI;
      })
      .then((perf) => {
        setData(perf);          // guardamos datos crudos
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  /* ─────────────── Cambio de proyecto en el <select> ─────────────── */
  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedId(value ? Number(value) : "");
    if (value) loadPerformance(Number(value));
    else setData(null);
  };

  /* ─────────────────────────────── RENDER ─────────────────────────── */
  return (
    <div style={{ padding: 20, fontFamily: "Arial, sans-serif" }}>
      <h1>Performance</h1>

      <Link href="/">
        <button>Back</button>
      </Link>
      <LogoutButton />

      {/* Selector de proyecto */}
      <div style={{ marginTop: 20, marginBottom: 10 }}>
        <select
          value={selectedId}
          onChange={handleSelect}
          style={{
            padding: "6px 12px",
            border: "1px solid #ccc",
            borderRadius: 4,
            minWidth: 250,
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

      {/* ---------------- Tabla solo cuando hay datos ---------------- */}
      {data && !loading && (() => {
        /* === Cálculos 100 % front-end  ============================ */

        /* Tarifa presupuestada por hora            */
        const hourlyRate =
          data.budgeted_hours && data.budgeted_hours > 0
            ? data.budgeted_cost / data.budgeted_hours
            : null;

        /* Actual Cost: SIEMPRE recalculado         */
        const actualCost =
          hourlyRate !== null
            ? hourlyRate * data.total_logged_hours
            : data.actual_cost;   // fallback si no hay horas presupuestadas

        /* Cost Variance: presupuesto – real        */
        const costVariance = data.budgeted_cost - actualCost;

        /* CPI                                       */
        const cpi =
          actualCost > 0 ? data.budgeted_cost / actualCost : null;

        /* Overtime                                  */
        const overtime =
          data.budgeted_hours === null
            ? null
            : Math.max(0, data.total_logged_hours - data.budgeted_hours);

        /* Status derivado: cualquier exceso → Over */
        const status =
          (data.budgeted_hours !== null &&
           data.total_logged_hours > data.budgeted_hours) ||
          costVariance < 0 ||
          (cpi !== null && cpi < 1)
            ? "Over budget"
            : "Within budget";

        /* === Tabla =============================== */
        return (
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginTop: 10,
              fontSize: 14,
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
                <td style={tdStyle}>{status}</td>
                <td style={tdStyle}>
                  {data.budgeted_hours !== null ? `${data.budgeted_hours}h` : "—"}
                </td>
                <td style={tdStyle}>
                  {formatDuration(data.total_logged_hours * 3600)}
                </td>
                <td style={tdStyle}>
                  {overtime === null
                    ? "—"
                    : overtime === 0
                    ? "0h 0m"
                    : formatDuration(overtime * 3600)}
                </td>
                <td style={tdStyle}>${data.budgeted_cost.toFixed(2)}</td>
                <td style={tdStyle}>${actualCost.toFixed(2)}</td>
                <td style={tdStyle}>${costVariance.toFixed(2)}</td>
                <td style={tdStyle}>{cpi !== null ? cpi.toFixed(2) : "—"}</td>
              </tr>
            </tbody>
          </table>
        );
      })()}
    </div>
  );
}

/* ---------------- Estilos simples ---------------- */
const thStyle = {
  border: "1px solid #ccc",
  padding: 8,
  textAlign: "left" as const,
};

const tdStyle = {
  border: "1px solid #ccc",
  padding: 8,
};
