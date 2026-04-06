import { Router } from "express";
import { db } from "@workspace/db";
import { aldeias, insertAldeiaSchema } from "@workspace/db";
import { eq, gt } from "drizzle-orm";

const router = Router();

router.get("/aldeias", async (req, res) => {
  try {
    const updatedAfter = req.query["updatedAfter"] as string | undefined;
    let query = db.select().from(aldeias);
    if (updatedAfter) {
      const date = new Date(updatedAfter);
      if (!isNaN(date.getTime())) {
        const results = await db
          .select()
          .from(aldeias)
          .where(gt(aldeias.updatedAt, date));
        res.json(results);
        return;
      }
    }
    const results = await db.select().from(aldeias);
    res.json(results);
  } catch (err) {
    req.log.error({ err }, "Failed to list aldeias");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/aldeias/:id", async (req, res) => {
  try {
    const [aldeia] = await db
      .select()
      .from(aldeias)
      .where(eq(aldeias.id, req.params.id));
    if (!aldeia) {
      res.status(404).json({ error: "Aldeia not found" });
      return;
    }
    res.json(aldeia);
  } catch (err) {
    req.log.error({ err }, "Failed to get aldeia");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/aldeias", async (req, res) => {
  try {
    const parsed = insertAldeiaSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid data", details: parsed.error });
      return;
    }
    const [created] = await db.insert(aldeias).values(parsed.data).returning();
    res.status(201).json(created);
  } catch (err) {
    req.log.error({ err }, "Failed to create aldeia");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
