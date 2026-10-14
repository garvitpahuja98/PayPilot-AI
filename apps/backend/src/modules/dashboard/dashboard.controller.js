/**
 * @file dashboard.controller.js
 * @description Controller for dashboard summary metrics.
 */

import * as dashboardService from './dashboard.service.js';
import { sendSuccess } from '../../utils/apiResponse.js';

export async function getSummary(req, res, next) {
  try {
    const summary = await dashboardService.getDashboardSummary(req.user?.id);
    return sendSuccess(res, summary);
  } catch (error) {
    return next(error);
  }
}
