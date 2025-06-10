import { useEffect, useState } from 'react'
import Link from 'next/link'
import Loader from './components/loader'

type Report = {
  id: number
  name: string
  type: string
  active: boolean
  start_date: string
  end_date: string
  created_on: string
  updated_on: string
  pdf_link: string
  permalink: string
  info: {
    projects: { id: string; name: string }[]
  }
}

export default function Reports() {
  const [data, setData] = useState<Report[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/reports')
      .then((res) => {
        if (!res.ok) throw new Error('Request failed')
        return res.json()
      })
      .then(setData)
      .catch((err) => setError(err.message))
  }, [])

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Reports</h1>
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
              <th style={thStyle}>Name</th>
              <th style={thStyle}>Date Range</th>
              <th style={thStyle}>Type</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Projects</th>
              <th style={thStyle}>Links</th>
            </tr>
          </thead>
          <tbody>
            {data.map((report) => (
              <tr key={report.id}>
                <td style={tdStyle}>{report.name}</td>
                <td style={tdStyle}>
                  {new Date(report.start_date).toLocaleDateString()} - {new Date(report.end_date).toLocaleDateString()}
                </td>
                <td style={tdStyle}>{report.type}</td>
                <td style={tdStyle}>{report.active ? 'Active' : 'Inactive'}</td>
                <td style={tdStyle}>{report.info.projects.length}</td>
                <td style={tdStyle}>
                  <a href={report.permalink} target="_blank" rel="noopener noreferrer">View</a> |{' '}
                  <a href={report.pdf_link} target="_blank" rel="noopener noreferrer">PDF</a>
                </td>
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
