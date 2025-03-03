import { Hono } from "hono"
import { serve } from "@hono/node-server"
import { cors } from "hono/cors"
import { logger } from "hono/logger"
import { positionsRouter } from "./routes/positions.js"
import { db } from "./db/connection.js"

const app = new Hono()

app.use("*", logger())
app.use("*", cors())

app.route("/api", positionsRouter(db))

app.get("/", (c) => c.json({ status: "ok", message: "API is running" }))

app.onError((err, c) => {
  console.error("Global error:", err)
  return c.json({ error: "Internal Server Error", message: err.message }, 500)
})

const port = process.env.PORT || 3000
console.log(`Server is running on port ${port}`)

serve({
  fetch: app.fetch,
  port
})

export default app