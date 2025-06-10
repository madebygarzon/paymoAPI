import type { NextApiRequest, NextApiResponse } from 'next';
import paymo from '../../lib/paymo';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { data } = await paymo.get('/projects', {
      params: { include: 'client' },
    });

    const projects = (data as any).projects || data;

    const detailed = await Promise.all(
      (projects as any[]).map(async (p) => {
        let timeWorked = 0;
        try {
          const { data: entryData } = await paymo.get('/entries', {
            params: { where: `project_id=${p.id}` },
          });
          const entries = (entryData as any).entries || [];
          timeWorked = entries.reduce(
            (total: number, e: any) => total + (e.duration || 0),
            0
          );
        } catch {
          // Ignore errors when computing time
        }

        const projectRate = p.flat_billing ? p.price : p.price_per_hour;
        const billingType =
          p.billing_type ?? (p.billable ? (p.flat_billing ? 'flat' : 'pph') : 'non');

        return {
          ...p,
          client_name: p.client?.name ?? '',
          project_rate: projectRate ?? null,
          time_worked: timeWorked,
          recorded_time: timeWorked,
          start_date: p.start_date ?? p.created_on,
          end_date: p.end_date ?? null,
          billing_type: billingType,
        };
      })
    );

    res.status(200).json(detailed);
  } catch (err) {
    console.error((err as Error).message);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
}
