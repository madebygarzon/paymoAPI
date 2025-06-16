
import type { AxiosInstance } from 'axios';


export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h ${m}m`;
}


/**
 * Retrieve all time entries from Paymo using pagination.
 *
 * @param paymo Axios client
 * @param params Query params (e.g. `where` or `include`)
 */
export async function fetchAllTimeEntries(
  paymo: AxiosInstance,
  params: Record<string, any>
): Promise<any[]> {
  const all: any[] = [];
  let page = 1;
  // Fetch pages until the response returns no items or we hit a high page cap
  while (page < 50) {
    const { data } = await paymo.get('/time_entries', {
      params: { ...params, page },
    });
    const items =
      (data as any).time_entries ?? (data as any).entries ?? data ?? [];
    if (!Array.isArray(items) || items.length === 0) break;
    all.push(...items);
    // If fewer than 100 results returned, assume last page
    if (items.length < 100 && !(data as any).meta?.next) break;
    page += 1;
  }
  return all;
}

/**
 * Retrieve total time worked for a project using the Reports endpoint.
 *
 * @param paymo Axios client
 * @param projectId ID of the project
 * @param from Optional start date (YYYY-MM-DD)
 * @param to Optional end date (YYYY-MM-DD)
 */
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
    include: { projects: true },
  };

  if (from || to) {
    if (from) {
      body.start_date = Math.floor(
        new Date(`${from}T00:00:00Z`).getTime() / 1000
      );
    }
    if (to) {
      body.end_date = Math.floor(
        new Date(`${to}T23:59:59Z`).getTime() / 1000
      );
    }
  } else {
    body.date_interval = 'all_time';
  }

  try {
    const { data } = await paymo.post('/reports', body);
    const items = data?.reports?.[0]?.content?.items ?? [];
    const total = (items as any[]).find((i) => i.type === 'total');
    return typeof total?.time === 'number' ? total.time : 0;
  } catch {
    return 0;
  }
}

