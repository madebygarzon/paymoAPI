
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

