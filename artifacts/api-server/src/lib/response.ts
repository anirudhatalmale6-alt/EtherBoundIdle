import type { Response } from "express";

interface SuccessResponse<T = unknown> {
  success: true;
  data: T;
}

interface ErrorResponse {
  success: false;
  error: string;
}

export type ApiResponse<T = unknown> = SuccessResponse<T> | ErrorResponse;

export function sendSuccess<T>(res: Response, data: T, status = 200): void {
  res.status(status).json({ success: true, data });
}

export function sendError(res: Response, status: number, message: string): void {
  res.status(status).json({ success: false, error: message });
}
