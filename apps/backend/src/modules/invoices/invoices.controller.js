/**
 * @file invoices.controller.js
 * @description Controllers for invoice endpoints.
 */

import * as invoicesService from './invoices.service.js';
import { sendSuccess } from '../../utils/apiResponse.js';
import { HTTP_STATUS } from '@paypilot/shared';

export async function listInvoices(req, res, next) {
  try {
    const { status, search, limit, page } = req.query;
    const result = await invoicesService.listInvoices({
      userId: req.user?.id,
      status,
      search,
      limit,
      page
    });
    return sendSuccess(res, result);
  } catch (error) {
    return next(error);
  }
}

export async function getInvoice(req, res, next) {
  try {
    const { id } = req.params;
    const invoice = await invoicesService.getInvoiceById(id, req.user?.id);
    return sendSuccess(res, invoice);
  } catch (error) {
    return next(error);
  }
}

export async function createInvoice(req, res, next) {
  try {
    const invoice = await invoicesService.createInvoice(req.user?.id, req.body);
    return sendSuccess(res, invoice, 'Invoice created successfully', HTTP_STATUS.CREATED);
  } catch (error) {
    return next(error);
  }
}

export async function updateInvoice(req, res, next) {
  try {
    const { id } = req.params;
    const updated = await invoicesService.updateInvoice(id, req.user?.id, req.body);
    return sendSuccess(res, updated, 'Invoice updated successfully');
  } catch (error) {
    return next(error);
  }
}

export async function deleteInvoice(req, res, next) {
  try {
    const { id } = req.params;
    const result = await invoicesService.cancelInvoice(id, req.user?.id);
    return sendSuccess(res, result, 'Invoice cancelled successfully');
  } catch (error) {
    return next(error);
  }
}
