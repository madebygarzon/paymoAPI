import type { NextApiRequest, NextApiResponse } from 'next';
import { createPaymoClient } from '../../lib/paymo';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const apiKey = req.cookies.paymo_api_key || process.env.PAYMO_API_KEY;
  if (!apiKey) {
    res.status(401).json({ error: 'API key not provided' });
    return;
  }

  const paymo = createPaymoClient(apiKey);

  try {
    const { data } = await paymo.get('/entries');
    res.status(200).json((data as any).entries || data);
  } catch (err) {
    console.error((err as Error).message);
    res.status(500).json({ error: 'Failed to fetch entries' });
  }
}
