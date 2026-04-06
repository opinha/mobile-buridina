import { Router } from "express";
import { db } from "@workspace/db";
import { membros, insertMembroSchema } from "@workspace/db";
import { eq, gt, ilike, or, and } from "drizzle-orm";

const router = Router();

router.get("/membros", async (req, res) => {
  try {
    const { aldeiaId, search, updatedAfter } = req.query as Record<
      string,
      string | undefined
    >;

    const conditions = [];

    if (aldeiaId) {
      conditions.push(eq(membros.aldeiaId, aldeiaId));
    }

    if (search && search.trim()) {
      const term = `%${search.trim()}%`;
      conditions.push(
        or(ilike(membros.nomeEtnico, term), ilike(membros.nomeSocial, term))
      );
    }

    if (updatedAfter) {
      const date = new Date(updatedAfter);
      if (!isNaN(date.getTime())) {
        conditions.push(gt(membros.updatedAt, date));
      }
    }

    const results =
      conditions.length > 0
        ? await db
            .select()
            .from(membros)
            .where(conditions.length === 1 ? conditions[0] : and(...conditions))
        : await db.select().from(membros);

    res.json(results);
  } catch (err) {
    req.log.error({ err }, "Failed to list membros");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/membros/:id", async (req, res) => {
  try {
    const [membro] = await db
      .select()
      .from(membros)
      .where(eq(membros.id, req.params.id));
    if (!membro) {
      res.status(404).json({ error: "Membro not found" });
      return;
    }
    res.json(membro);
  } catch (err) {
    req.log.error({ err }, "Failed to get membro");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/membros", async (req, res) => {
  try {
    const parsed = insertMembroSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid data", details: parsed.error });
      return;
    }
    const [created] = await db.insert(membros).values(parsed.data).returning();
    res.status(201).json(created);
  } catch (err) {
    req.log.error({ err }, "Failed to create membro");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
