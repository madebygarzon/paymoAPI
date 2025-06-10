import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Reports() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/reports')
      .then((res) => {
        if (!res.ok) throw new Error('Request failed');
        return res.json();
      })
      .then(setData)
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Reports</h1>
      <Link href="/"><button>Back</button></Link>
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {!data && !error && <p>Loading...</p>}
      {data && <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(data, null, 2)}</pre>}
    </div>
  );
}
