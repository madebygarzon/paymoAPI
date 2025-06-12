import { useRouter } from 'next/router'

export default function LogoutButton() {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await fetch('/api/login', { method: 'DELETE' })
    } catch {
      // ignore network errors
    }

    if (typeof window !== 'undefined') {
      try { localStorage.clear() } catch {}
      try { sessionStorage.clear() } catch {}
    }

    router.push('/login')
  }

  return (
    <button onClick={handleLogout} className="px-4 py-2 border rounded bg-red-500 text-white">
      Logout
    </button>
  )
}
