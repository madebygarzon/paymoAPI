import type { NextApiRequest, NextApiResponse } from 'next';
import { createPaymoClient } from '../../../lib/paymo';
import { getSingleProjectPerformance } from '../../../lib/performance';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id, from, to } = req.query;
  if (!id || Array.isArray(id)) {
    res.status(400).json({ error: 'Invalid project id' });
    return;
  }

  const apiKey = req.cookies.paymo_api_key || process.env.PAYMO_API_KEY;
  if (!apiKey) {
    res.status(401).json({ error: 'API key not provided' });
    return;
  }

  const paymo = createPaymoClient(apiKey);

  try {
    const data = await getSingleProjectPerformance(
      paymo,
      Number(id),
      typeof from === 'string' ? from : undefined,
      typeof to === 'string' ? to : undefined
    );
    res.status(200).json(data);
  } catch (err) {
    const status = (err as any)?.response?.status ?? 500;
    console.error((err as Error).message);
    if (status === 401 || status === 403) {
      res.status(401).json({ error: 'Unauthorized - check PAYMO_API_KEY' });
    } else {
      res.status(500).json({ error: 'Failed to compute performance' });
    }
  }
}
