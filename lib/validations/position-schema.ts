import { z } from "zod"

export const positionSchema = z.object({
  name: z.string().min(1, { message: "Position name is required" }),
  description: z.string().optional(),
  parentId: z.string().nullable(),
})

export type PositionFormValues = z.infer<typeof positionSchema>

