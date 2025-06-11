import Link from 'next/link';
import Loader from '../pages/components/loader';


export default function Home() {
  return (
    <div className="p-5 font-sans">
      <h1 className="text-2xl font-bold mb-2">Paymo API Interface</h1>
      <p className="mb-4">Available interfaces:</p>
      <div className="flex gap-2 flex-wrap">
        <Link href="/projects"><button className="px-4 py-2 border rounded">Projects</button></Link>
        <Link href="/entries"><button className="px-4 py-2 border rounded">Entries</button></Link>
        <Link href="/invoices"><button className="px-4 py-2 border rounded">Invoices</button></Link>
        <Link href="/reports"><button className="px-4 py-2 border rounded">Reports</button></Link>
        <Link href="/performance"><button className="px-4 py-2 border rounded">Performance</button></Link>
      </div>
       <Loader />
    </div>
  );
}
