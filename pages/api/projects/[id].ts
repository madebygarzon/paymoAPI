import type { NextApiRequest, NextApiResponse } from 'next';
import paymo from '../../../lib/paymo';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;
  if (!id || Array.isArray(id)) {
    res.status(400).json({ error: 'Invalid project id' });
    return;
  }

  try {
    const { data } = await paymo.get(`/projects/${id}`, {
      params: { include: 'client,tasks.entries' },
    });
    const p = (data as any).projects?.[0] ?? (data as any);

    if (!p.active) {
      res.status(404).json({ error: 'Project not active' });
      return;
    }

    let timeWorked = 0;
    let startDate: string | null = null;
    let endDate: string | null = null;

    const tasks = p.tasks || [];
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

    const projectRate = p.flat_billing ? p.price : p.price_per_hour;
    const billingType =
      p.billing_type ?? (p.billable ? (p.flat_billing ? 'flat' : 'pph') : 'non');
    const projectFee = p.flat_billing
      ? p.price ?? p.estimated_price ?? null
      : (p.price_per_hour ?? 0) * (timeWorked / 3600);

    res.status(200).json({
      id: p.id,
      name: p.name,
      code: p.code,
      client_name: p.client?.name ?? '',
      active: p.active,
      budget_hours: p.budget_hours ?? null,
      price_per_hour: p.price_per_hour ?? null,
      project_fee: projectFee,
      time_worked: timeWorked,
      recorded_time: timeWorked,
      start_date: startDate ?? p.start_date ?? p.created_on,
      end_date: endDate ?? p.end_date ?? null,
      billing_type: billingType,
      updated_on: p.updated_on,
      color: p.color ?? null,
    });
  } catch (err) {
    const status = (err as any)?.response?.status ?? 500;
    console.error((err as Error).message);
    if (status === 401 || status === 403) {
      res.status(401).json({ error: 'Unauthorized - check PAYMO_API_KEY' });
    } else {
      res.status(500).json({ error: 'Failed to fetch project details' });
    }

  }
}
