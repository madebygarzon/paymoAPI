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
        let startDate: string | null = null;
        let endDate: string | null = null;

        try {
          const { data: projData } = await paymo.get(`/projects/${p.id}`, {
            params: { include: 'tasks.entries' },
          });

          const detailedProject =
            (projData as any).projects?.[0] ?? (projData as any);
          const tasks = detailedProject.tasks || [];
          const entries = tasks.flatMap((t: any) => t.entries || []);

          if (entries.length) {
            const startTimes = entries.map((e: any) =>
              new Date(e.start_time ?? e.date).getTime()
            );
            const endTimes = entries.map((e: any) =>
              new Date(e.end_time ?? e.start_time ?? e.date).getTime()
            );
            startDate = new Date(Math.min(...startTimes)).toISOString();
            endDate = new Date(Math.max(...endTimes)).toISOString();

            timeWorked = entries.reduce(
              (total: number, e: any) => total + (e.duration || 0),
              0
            );
          }
        } catch {
          // Ignore errors when computing details
        }

        const projectRate = p.flat_billing ? p.price : p.price_per_hour;
        const billingType =
          p.billing_type ?? (p.billable ? (p.flat_billing ? 'flat' : 'pph') : 'non');
        const projectFee = p.flat_billing
          ? p.price ?? p.estimated_price ?? null
          : ((p.price_per_hour ?? 0) * (timeWorked / 3600));

        return {
          ...p,
          client_name: p.client?.name ?? '',
          project_rate: projectRate ?? null,
          project_fee: projectFee,
          time_worked: timeWorked,
          recorded_time: timeWorked,
          start_date: startDate ?? p.start_date ?? p.created_on,
          end_date: endDate ?? p.end_date ?? null,
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
