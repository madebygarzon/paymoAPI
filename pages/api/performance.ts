import type { NextApiRequest, NextApiResponse } from 'next';
import { getProjectPerformance } from '../../lib/performance';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { from, to } = req.query;
  try {
    const data = await getProjectPerformance(
      typeof from === 'string' ? from : undefined,
      typeof to === 'string' ? to : undefined
    );
    res.status(200).json(data);
  } catch (err) {
    console.error((err as Error).message);
    res.status(500).json({ error: 'Failed to compute performance' });
  }
}
