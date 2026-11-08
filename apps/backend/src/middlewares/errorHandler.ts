import { NextFunction, Request, Response } from "express"
import { Prisma } from "@prisma/client"
import { ZodError } from "zod"
import { AppError } from "../errors/AppError"

/**
 * Every error response has the same shape:
 * { "error": { "code": "...", "message": "...", "details"?: [...] } }
 */
function sendError(
  res: Response,
  status: number,
  code: string,
  message: string,
  details?: unknown
) {
  res.status(status).json({
    error: { code, message, ...(details !== undefined ? { details } : {}) },
  })
}

// express.json() throws this when the body is not valid JSON
function isInvalidJsonError(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    (err as { type?: unknown }).type === "entity.parse.failed"
  )
}

// Unknown routes -> JSON instead of Express' default HTML page
export function notFoundHandler(req: Request, res: Response) {
  sendError(res, 404, "ROUTE_NOT_FOUND", `Route ${req.method} ${req.originalUrl} not found`)
}

// Must be registered last and keep 4 parameters, otherwise Express won't treat it as an error handler
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof ZodError) {
    const details = err.issues.map((issue) => ({
      field: issue.path.map(String).join("."),
      message: issue.message,
    }))
    return sendError(res, 400, "VALIDATION_ERROR", "Invalid request data", details)
  }

  if (err instanceof AppError) {
    return sendError(res, err.statusCode, err.code, err.message, err.details)
  }

  // Prisma: update/delete on a record that does not exist
  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
    return sendError(res, 404, "NOT_FOUND", "Resource not found")
  }

  if (isInvalidJsonError(err)) {
    return sendError(res, 400, "INVALID_JSON", "Request body is not valid JSON")
  }

  // Anything else is a bug: log it, but never leak internals to the client
  console.error("Unhandled error:", err)
  return sendError(res, 500, "INTERNAL_ERROR", "Something went wrong")
}
