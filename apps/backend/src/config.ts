import "dotenv/config"
import { z } from "zod"

/**
 * All configuration comes from environment variables and is validated ONCE at
 * startup. If something is wrong the app stops right away with a readable
 * message, instead of failing later in a confusing way.
 *
 * Local development: copy .env.example to .env
 * Deployment: set the same variables in the hosting dashboard
 */
const envSchema = z
  .object({
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    PORT: z.coerce.number().int().min(1).max(65535).default(3000),
    DATABASE_URL: z
      .string({ error: "DATABASE_URL is required (see .env.example)" })
      .min(1, "DATABASE_URL is required (see .env.example)"),
    // Allowed browser origins for CORS and Socket.IO, comma separated
    CORS_ORIGIN: z.string().optional(),
  })
  .refine((env) => env.NODE_ENV !== "production" || Boolean(env.CORS_ORIGIN), {
    path: ["CORS_ORIGIN"],
    message:
      "CORS_ORIGIN is required in production (for example https://your-frontend.netlify.app)",
  })

const result = envSchema.safeParse(process.env)

if (!result.success) {
  console.error("Invalid environment configuration:")

  for (const issue of result.error.issues) {
    console.error(`  - ${issue.path.map(String).join(".") || "(root)"}: ${issue.message}`)
  }

  process.exit(1)
}

const env = result.data

// "*" (or nothing) allows any origin: fine for local development only
function parseCorsOrigin(value: string | undefined): string | string[] {
  if (!value || value.trim() === "*") return "*"

  return value
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)
}

export const config = {
  nodeEnv: env.NODE_ENV,
  port: env.PORT,
  databaseUrl: env.DATABASE_URL,
  corsOrigin: parseCorsOrigin(env.CORS_ORIGIN),
}
