import type { NextApiRequest, NextApiResponse } from 'next';
import paymo from '../../../lib/paymo';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { data } = await paymo.get('/projects', {
      params: { include: 'client', where: 'active=true' },
    });

    const projects = (data as any).projects || data;

    const summaries = (projects as any[]).map((p) => ({
      id: p.id,
      name: p.name,
      code: p.code,
      client_name: p.client?.name ?? '',
      color: p.color ?? null,
      updated_on: p.updated_on,
      active: p.active,
    }));

    res.status(200).json(summaries);
  } catch (err) {
    console.error((err as Error).message);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
}
