/**
 * @file dashboardService.js
 * @description Frontend service for fetching financial dashboard summaries.
 */

import { request } from './apiClient.js';

export async function fetchDashboardSummary() {
  return request('/dashboard/summary');
}
