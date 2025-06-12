import { useEffect, useState } from 'react'
import Link from 'next/link'
import LogoutButton from './components/logoutButton'

type Invoice = {
  id: number
  number: string
  title: string
  bill_to: string
  date: string
  due_date: string
  status: string
  currency: string
  total: number
  pdf_link: string
  permalink: string
}

export default function Invoices() {
  const [data, setData] = useState<Invoice[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/invoices')
      .then((res) => {
        if (!res.ok) throw new Error('Request failed')
        return res.json()
      })
      .then(setData)
      .catch((err) => setError(err.message))
  }, [])

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Invoices</h1>
      <Link href="/"><button>Back</button></Link>
      <LogoutButton />
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {!data && !error && <p>Loading...</p>}
      {data && (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px', fontSize: '14px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f0f0f0' }}>
              <th style={thStyle}>Number</th>
              <th style={thStyle}>Client</th>
              <th style={thStyle}>Date</th>
              <th style={thStyle}>Due</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Total</th>
              <th style={thStyle}>PDF</th>
              <th style={thStyle}>View</th>
            </tr>
          </thead>
          <tbody>
            {data.map((invoice) => (
              <tr key={invoice.id}>
                <td style={tdStyle}>{invoice.number}</td>
                <td style={tdStyle}>{invoice.bill_to}</td>
                <td style={tdStyle}>{invoice.date}</td>
                <td style={tdStyle}>{invoice.due_date}</td>
                <td style={{ ...tdStyle, textTransform: 'capitalize' }}>{invoice.status}</td>
                <td style={tdStyle}>{invoice.currency} ${invoice.total.toFixed(2)}</td>
                <td style={tdStyle}><a href={invoice.pdf_link} target="_blank" rel="noopener noreferrer">PDF</a></td>
                <td style={tdStyle}><a href={invoice.permalink} target="_blank" rel="noopener noreferrer">HTML</a></td>
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
