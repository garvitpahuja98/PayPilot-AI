/**
 * @file payments.controller.js
 * @description Controllers for PayPal order creation and capture endpoints.
 */

import * as paymentsService from './payments.service.js';
import { sendSuccess } from '../../utils/apiResponse.js';
import { HTTP_STATUS } from '@paypilot/shared';

export async function createOrder(req, res, next) {
  try {
    const { invoiceId } = req.body;
    const order = await paymentsService.createOrder(invoiceId, req.user?.id);
    return sendSuccess(res, order, 'PayPal order initialized', HTTP_STATUS.CREATED);
  } catch (error) {
    return next(error);
  }
}

export async function captureOrder(req, res, next) {
  try {
    const { paypalOrderId, invoiceId } = req.body;
    const payment = await paymentsService.captureOrder({ paypalOrderId, invoiceId }, req.user?.id);
    return sendSuccess(res, payment, 'Payment captured and verified successfully');
  } catch (error) {
    return next(error);
  }
}
