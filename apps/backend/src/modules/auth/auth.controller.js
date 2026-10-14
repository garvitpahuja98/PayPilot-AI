/**
 * @file auth.controller.js
 * @description Authentication route controllers.
 */

import * as authService from './auth.service.js';
import { sendSuccess } from '../../utils/apiResponse.js';

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const result = await authService.loginUser({ email, password });
    return sendSuccess(res, result, 'Login successful');
  } catch (error) {
    return next(error);
  }
}

export async function getProfile(req, res, next) {
  try {
    const user = await authService.getCurrentUserProfile(req.user?.id);
    return sendSuccess(res, user);
  } catch (error) {
    return next(error);
  }
}
