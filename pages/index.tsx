import Link from 'next/link';
import Loader from '../pages/components/loader';


export default function Home() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Paymo API Interface</h1>
      <p>Available interfaces:</p>
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <Link href="/projects"><button>Projects</button></Link>
        <Link href="/entries"><button>Entries</button></Link>
        <Link href="/invoices"><button>Invoices</button></Link>
        <Link href="/reports"><button>Reports</button></Link>
      </div>
       <Loader /> 
    </div>
  );
}
