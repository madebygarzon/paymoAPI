import { useEffect, useState } from 'react'
import Link from 'next/link'
import Loader from './components/loader'

interface Perf {
  project_id: number
  name: string
  total_logged_hours: number
  budgeted_hours: number | null
  budgeted_cost: number
  actual_cost: number
  cost_variance: number
  cost_performance_index: number | null
  status: string
}

export default function Performance() {
  const [data, setData] = useState<Perf[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/performance')
      .then((res) => {
        if (!res.ok) throw new Error('Request failed')
        return res.json()
      })
      .then(setData)
      .catch((err) => setError(err.message))
  }, [])

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Performance</h1>
      <Link href="/"><button>Back</button></Link>
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {!data && !error && <Loader />}
      {data && (
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          marginTop: '20px',
          fontSize: '14px'
        }}>
          <thead>
            <tr style={{ backgroundColor: '#f0f0f0' }}>
              <th style={thStyle}>Project</th>
              <th style={thStyle}>Logged Hours</th>
              <th style={thStyle}>Budgeted Hours</th>
              <th style={thStyle}>Budgeted Cost</th>
              <th style={thStyle}>Actual Cost</th>
              <th style={thStyle}>Cost Variance</th>
              <th style={thStyle}>CPI</th>
              <th style={thStyle}>Status</th>
            </tr>
          </thead>
          <tbody>
            {data.map((p) => (
              <tr key={p.project_id}>
                <td style={tdStyle}>{p.name}</td>
                <td style={tdStyle}>{p.total_logged_hours.toFixed(2)}</td>
                <td style={tdStyle}>{p.budgeted_hours ?? '—'}</td>
                <td style={tdStyle}>${p.budgeted_cost.toFixed(2)}</td>
                <td style={tdStyle}>${p.actual_cost.toFixed(2)}</td>
                <td style={tdStyle}>${p.cost_variance.toFixed(2)}</td>
                <td style={tdStyle}>{p.cost_performance_index?.toFixed(2) ?? '—'}</td>
                <td style={tdStyle}>{p.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

const thStyle = {
  border: '1px solid #ccc',
  padding: '8px',
  textAlign: 'left' as const,
}

const tdStyle = {
  border: '1px solid #ccc',
  padding: '8px',
}
