import { useState } from 'react';
import { useRouter } from 'next/router';

export default function Login() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      const from = (router.query.from as string) || '/';
      router.push(from);
    } else {
      setError('Invalid password. Please try again.');
    }
  };

  return (
    <div className="p-5 font-sans">
      <h1 className="text-xl font-bold mb-2">Enter a password</h1>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="border px-2 py-1"
        />
        <button type="submit" className="px-4 py-1 bg-blue-500 text-white rounded">Enter</button>
      </form>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
}
