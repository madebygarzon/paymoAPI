import type { NextApiRequest, NextApiResponse } from 'next';
import paymo from '../../lib/paymo';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { data } = await paymo.get('/reports');
    res.status(200).json((data as any).reports || data);
  } catch (err) {
    console.error((err as Error).message);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
}
