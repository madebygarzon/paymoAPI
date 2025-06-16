import type { NextApiRequest, NextApiResponse } from 'next';
import { createPaymoClient } from '../../../lib/paymo';
import { fetchProjectWorkedSeconds } from '../../../lib/time';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;
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
    const { data } = await paymo.get(`/projects/${id}`, {
      params: { include: 'client' },
    });
    const p = (data as any).projects?.[0] ?? (data as any);

    if (!p.active) {
      res.status(404).json({ error: 'Project not active' });
      return;
    }

  let timeWorked = await fetchProjectWorkedSeconds(paymo, Number(id));
  if (!timeWorked && typeof p.recorded_time === 'number') {
    timeWorked = p.recorded_time;
  }

  const startDate: string | null = p.start_date ?? p.created_on;
  const endDate: string | null = p.end_date ?? null;

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
      recorded_time: typeof p.recorded_time === 'number' ? p.recorded_time : timeWorked,
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
