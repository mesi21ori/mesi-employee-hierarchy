import { Hono } from "hono";
import { eq, isNull } from "drizzle-orm";
import { positions, Position } from "../../drizzle/schema.js";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";

export const positionsRouter = (db: PostgresJsDatabase) => {
  
  const router = new Hono();

  router.post("/positions", async (c) => {
    try {
      const { name, description, parentId } = await c.req.json();

      if (!parentId) {
        const existingRootPosition = await db.select().from(positions).where(isNull(positions.parentId)).limit(1);
        if (existingRootPosition.length > 0) {
          return c.json({ error: "A root position already exists." }, 400);
        }
      }
  
      const newPosition = await db
        .insert(positions)
        .values({
          name,
          description,
          parentId: parentId || null,
        })
        .returning();
  
      return c.json({ message: "Position created successfully", data: newPosition[0] });
    } catch (error) {
      console.error("Error creating position:", error);
      return c.json({ error: "Failed to create position", details: (error as Error).message }, 500);
    }
  });
  
  router.put("/positions/:id", async (c) => {
    try {
      const id = c.req.param("id");
      const { name, description, parentId } = await c.req.json();
      const existingPosition = await db.select().from(positions).where(eq(positions.id, id)).limit(1);
      if (existingPosition.length === 0) {
        return c.json({ error: "Position not found" }, 404);
      }
      if (!parentId) {
        const existingRootPosition = await db.select().from(positions).where(isNull(positions.parentId)).limit(1);
        if (existingRootPosition.length > 0 && existingRootPosition[0].id !== id) {
          return c.json({ error: "A root position already exists." }, 400);
        }
      } else {
        const parentExists = await db.select().from(positions).where(eq(positions.id, parentId)).limit(1);
        if (parentExists.length === 0) {
          return c.json({ error: "Invalid parent ID. The specified parent position does not exist." }, 400);
        }
      }
  
      const updatedPosition = await db
        .update(positions)
        .set({ name, description, parentId: parentId || null })
        .where(eq(positions.id, id))
        .returning();
  
      return c.json({ message: "Position updated successfully", data: updatedPosition[0] });
    } catch (error) {
      console.error("Error updating position:", error);
      return c.json({ error: "Failed to update position", details: (error as Error).message }, 500);
    }
  });
  
  router.get("/positions/:id", async (c) => {
    try {
      const id = c.req.param("id");
      const position = await db.select().from(positions).where(eq(positions.id, id)).limit(1);

      if (position.length === 0) {
        return c.json({ error: "Position not found" }, 404);
      }

      return c.json({ data: position[0] });
    } catch (error) {
      console.error("Error fetching position:", error);
      return c.json({ error: "Failed to fetch position", details: (error as Error).message }, 500);
    }
  });


  router.get("/positions", async (c) => {
    try {
      const positionsList = await db.select().from(positions);

      const buildTree = (items: Position[], parentId: string | null = null): Position[] => {
        return items
          .filter((item) => item.parentId === parentId)
          .map((item) => ({
            ...item,
            children: buildTree(items, item.id),
          }));
      };

      const tree = buildTree(positionsList);
      return c.json({ data: tree });
    } catch (error) {
      console.error("Error fetching positions:", error);
      return c.json({ error: "Failed to fetch positions", details: (error as Error).message }, 500);
    }
  });

  router.get("/positions/:id/children", async (c) => {
    try {
      const id = c.req.param("id");
      const children = await db.select().from(positions).where(eq(positions.parentId, id));
      return c.json({ data: children });
    } catch (error) {
      console.error("Error fetching children:", error);
      return c.json({ error: "Failed to fetch children", details: (error as Error).message }, 500);
    }
  });

  router.delete("/positions/:id", async (c) => {
    try {
      const id = c.req.param("id");
      const deletedPosition = await db.delete(positions).where(eq(positions.id, id)).returning();

      if (deletedPosition.length === 0) {
        return c.json({ error: "Position not found" }, 404);
      }

      return c.json({ message: "Position deleted successfully" });
    } catch (error) {
      console.error("Error deleting position:", error);
      return c.json({ error: "Failed to delete position", details: (error as Error).message }, 500);
    }
  });

  return router;
};