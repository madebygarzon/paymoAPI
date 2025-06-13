import type { AxiosInstance } from 'axios';

export interface ProjectPerformance {
  project_id: number;
  name: string;
  total_logged_hours: number;
  budgeted_hours: number | null;
  budgeted_cost: number;
  actual_cost: number;
  cost_variance: number;
  cost_performance_index: number | null;
  status: string;
}

/**
 * Fetches performance metrics for all projects in the account.
 *
 * @param from Optional start date (YYYY-MM-DD) to filter time entries
 * @param to Optional end date (YYYY-MM-DD) to filter time entries
 * @returns Array of ProjectPerformance objects
 */
export async function getProjectPerformance(
  paymo: AxiosInstance,
  from?: string,
  to?: string
): Promise<ProjectPerformance[]> {
  const { data } = await paymo.get('/projects', { params: { include: 'tasks' } });
  const projects = (data as any).projects ?? data;

  const summaries: ProjectPerformance[] = await Promise.all(
    (projects as any[]).map(async (project) => {
      const whereClauses = [`project_id=${project.id}`];
      if (from) whereClauses.push(`date>="${from}"`);
      if (to) whereClauses.push(`date<="${to}"`);
      const where = whereClauses.join(' and ');

      let totalSeconds = 0;
      try {
        const { data: entriesData } = await paymo.get('/time_entries', {
          params: { where, include: 'task' },
        });
        const entries = (entriesData as any).time_entries ?? entriesData?.entries ?? entriesData ?? [];
        totalSeconds = (entries as any[]).reduce(
          (sum, e) => sum + (e.duration ?? 0),
          0
        );
      } catch {
        // ignore errors fetching entries for a project
      }

      const loggedHours = totalSeconds / 3600;

      // compute budget hours
      let budgetHours = project.budget_hours ?? 0;
      const tasks = project.tasks ?? [];
      const taskBudgets = tasks.reduce(
        (sum: number, t: any) => sum + (t.budget_hours ?? 0),
        0
      );
      if (!budgetHours && taskBudgets) {
        budgetHours = taskBudgets;
      }

      const rate = project.flat_billing
        ? 0
        : project.price_per_hour ?? 0;
      const budgetedCost = project.flat_billing
        ? project.price ?? project.estimated_price ?? 0
        : budgetHours * rate;
      const actualCost = loggedHours * rate;

      const costPerformanceIndex = actualCost > 0 ? budgetedCost / actualCost : null;

      const summary: ProjectPerformance = {
        project_id: project.id,
        name: project.name,
        total_logged_hours: loggedHours,
        budgeted_hours: budgetHours || null,
        budgeted_cost: budgetedCost,
        actual_cost: actualCost,
        cost_variance: budgetedCost - actualCost,
        cost_performance_index: costPerformanceIndex,
        status: actualCost <= budgetedCost
          ? 'Within budget'
          : 'Over budget',
      };
      return summary;
    })
  );

  return summaries;
}
