import type { AxiosInstance } from 'axios';

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchProjectWorkedSeconds(
  paymo: AxiosInstance,
  projectId: number,
  from?: string,
  to?: string
): Promise<number> {
  const body: any = {
    type: 'temp',
    projects: [projectId],
    users: 'all',
    date_interval: 'all_time',
    include: { projects: true },
  };

  if (from || to) {
    if (from) {
      body.start_date = Math.floor(new Date(`${from}T00:00:00Z`).getTime() / 1000);
    }
    if (to) {
      body.end_date = Math.floor(new Date(`${to}T23:59:59Z`).getTime() / 1000);
    }
    delete body.date_interval;
  }

  try {
    await delay(5000); // <- espera entre cada solicitud para evitar saturar la API
    const { data } = await paymo.post('/reports', body);
    const items = data?.reports?.[0]?.content?.items ?? [];
    const projectItem = (items as any[]).find(
      (i) => i.type === 'project' && i.id === projectId
    );

    console.log(`[PAYMO] Project ${projectId} – Time: ${projectItem?.time ?? 0} seconds`);
    return typeof projectItem?.time === 'number' ? projectItem.time : 0;
  } catch (error: any) {
    if (error.response?.status === 429) {
      console.warn(`[RATE LIMIT] 429 – Project ${projectId}. Retrying in 5000ms...`);
      await delay(5000); // espera más antes de reintentar
      return fetchProjectWorkedSeconds(paymo, projectId, from, to);
    }

    console.error(`[ERROR] Project ${projectId} – ${error.message}`);
    return 0;
  }
}
