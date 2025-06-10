import { useEffect, useState } from 'react'
import Link from 'next/link'
import Loader from './components/loader'

type Project = {
  id: number
  name: string
  code: string
  client_name: string
  active: boolean
  budget_hours: number | null
  billing_type: string
  updated_on: string
  color: string | null
}

export default function Projects() {
  const [data, setData] = useState<Project[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/projects')
      .then((res) => {
        if (!res.ok) throw new Error('Request failed')
        return res.json()
      })
      .then(setData)
      .catch((err) => setError(err.message))
  }, [])

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Projects</h1>
      <Link href="/"><button>Back</button></Link>
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
              <th style={thStyle}>Active</th>
              <th style={thStyle}>Budget Hours</th>
              <th style={thStyle}>Billing</th>
              <th style={thStyle}>Updated</th>
            </tr>
          </thead>
          <tbody>
            {data.map((project) => (
              <tr key={project.id}>
                <td style={tdStyle}>
                  <span style={{
                    display: 'inline-block',
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: project.color || '#ccc',
                    marginRight: '8px'
                  }} />
                  {project.name}
                </td>
                <td style={tdStyle}>{project.code}</td>
                <td style={tdStyle}>{project.client_name}</td>
                <td style={{ ...tdStyle, color: project.active ? 'green' : 'gray' }}>
                  {project.active ? 'Yes' : 'No'}
                </td>
                <td style={tdStyle}>{project.budget_hours ?? '—'}</td>
                <td style={tdStyle}>{project.billing_type.toUpperCase()}</td>
                <td style={tdStyle}>{new Date(project.updated_on).toLocaleDateString()}</td>
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
