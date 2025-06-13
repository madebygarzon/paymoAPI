import { useEffect, useState } from 'react'
import Link from 'next/link'
import Loader from './components/loader'
import LogoutButton from './components/logoutButton'
import { formatDuration } from '../lib/time'

type ProjectSummary = {
  id: number
  name: string
  code: string
  client_name: string
  active: boolean
  updated_on: string
  color: string | null
}

type ProjectDetail = ProjectSummary & {
  budget_hours: number | null
  price_per_hour: number | null
  project_fee: number | null
  time_worked: number
  recorded_time: number
  start_date: string | null
  end_date: string | null
  billing_type: string
}

export default function Projects() {
  const [data, setData] = useState<ProjectSummary[] | null>(null)
  const [selected, setSelected] = useState<ProjectDetail | null>(null)
  const [loadingId, setLoadingId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/projects')
      .then(async (res) => {
        const body = await res.json().catch(() => null)
        if (!res.ok) throw new Error(body?.error || 'Request failed')
        return body
      })
      .then(setData)
      .catch((err) => setError(err.message))
  }, [])

  const loadDetails = (id: number) => {
    setLoadingId(id)
    fetch(`/api/projects/${id}`)

      .then(async (res) => {
        const body = await res.json().catch(() => null)
        if (!res.ok) throw new Error(body?.error || 'Request failed')
        return body
      })
      .then((detail) => {
        setSelected(detail)
        setLoadingId(null)
      })
      .catch((err) => {
        setError(err.message)
        setLoadingId(null)
      })
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Projects</h1>
      <Link href="/"><button>Back</button></Link>
      <LogoutButton />
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {!data && !error && <Loader/>}
      {data && (
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          marginTop: '20px',
          fontSize: '14px'
        }}>
          <thead>
            <tr style={{ backgroundColor: '#f0f0f0' }}>
              <th style={thStyle}>Name</th>
              <th style={thStyle}>Code</th>
              <th style={thStyle}>Client</th>
              <th style={thStyle}>Updated</th>
              <th style={thStyle}>Action</th>
            </tr>
          </thead>
          <tbody>
            {data.map((project) => (
              <tr key={project.id}>
                <td style={tdStyle}>
                  <span
                    style={{
                      display: 'inline-block',
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      backgroundColor: project.color || '#ccc',
                      marginRight: '8px'
                    }}
                  />
                  {project.name}
                </td>
                <td style={tdStyle}>{project.code}</td>
                <td style={tdStyle}>{project.client_name}</td>
                <td style={tdStyle}>{new Date(project.updated_on).toLocaleDateString()}</td>
                <td style={tdStyle}>
                  <button onClick={() => loadDetails(project.id)} disabled={loadingId === project.id}>
                    {loadingId === project.id ? 'Loading...' : 'View'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {selected && (
        <div style={{ marginTop: '20px' }}>
          <h2>Project Details</h2>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            marginTop: '10px',
            fontSize: '14px'
          }}>
            <tbody>
              <tr>
                <td style={tdStyle}>Start</td>
                <td style={tdStyle}>{selected.start_date ? new Date(selected.start_date).toLocaleDateString() : '—'}</td>
              </tr>
              <tr>
                <td style={tdStyle}>End</td>
                <td style={tdStyle}>{selected.end_date ? new Date(selected.end_date).toLocaleDateString() : '—'}</td>
              </tr>
              <tr>
                <td style={tdStyle}>Rate</td>
                <td style={tdStyle}>{selected.price_per_hour ?? '—'}</td>
              </tr>
              <tr>
                <td style={tdStyle}>Fee</td>
                <td style={tdStyle}>{selected.project_fee?.toFixed(2) ?? '—'}</td>
              </tr>
              <tr>
                <td style={tdStyle}>Time Worked</td>
                <td style={tdStyle}>{formatDuration(selected.time_worked)}</td>
              </tr>
              <tr>
                <td style={tdStyle}>Budget Hours</td>
                <td style={tdStyle}>{selected.budget_hours ?? '—'}</td>
              </tr>
              <tr>
                <td style={tdStyle}>Recorded Time</td>
                <td style={tdStyle}>{formatDuration(selected.recorded_time)}</td>
              </tr>
              <tr>
                <td style={tdStyle}>Billing</td>
                <td style={tdStyle}>{selected.billing_type.toUpperCase()}</td>
              </tr>
            </tbody>
          </table>
        </div>
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
