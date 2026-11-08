/**
 * Base class for errors we throw on purpose.
 * The error middleware turns them into a consistent JSON response.
 */
export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown
  ) {
    super(message)
    this.name = new.target.name
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(404, "NOT_FOUND", message)
  }
}

export class ConflictError extends AppError {
  constructor(message = "Request conflicts with the current state") {
    super(409, "CONFLICT", message)
  }
}
