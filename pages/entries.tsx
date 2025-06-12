import { useEffect, useState } from 'react'
import Link from 'next/link'
import Loader from './components/loader'
import LogoutButton from './components/logoutButton'

type Entry = {
  id: number
  task_id: number
  user_id: number
  date: string
  duration: number
  cost: number
  price: number
  status: string
}

export default function Entries() {
  const [data, setData] = useState<Entry[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/entries')
      .then((res) => {
        if (!res.ok) throw new Error('Request failed')
        return res.json()
      })
      .then(setData)
      .catch((err) => setError(err.message))
  }, [])

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Entries</h1>
      <Link href="/"><button>Back</button></Link>
      <LogoutButton />
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
              <th style={thStyle}>Date</th>
              <th style={thStyle}>Task ID</th>
              <th style={thStyle}>Duration (hrs)</th>
              <th style={thStyle}>Cost</th>
              <th style={thStyle}>Price</th>
              <th style={thStyle}>Status</th>
            </tr>
          </thead>
          <tbody>
            {data.map((entry) => (
              <tr key={entry.id}>
                <td style={tdStyle}>{entry.date}</td>
                <td style={tdStyle}>{entry.task_id}</td>
                <td style={tdStyle}>{(entry.duration / 3600).toFixed(2)}</td>
                <td style={tdStyle}>${entry.cost}</td>
                <td style={tdStyle}>${entry.price}</td>
                <td style={{ ...tdStyle, textTransform: 'capitalize' }}>{entry.status}</td>
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
