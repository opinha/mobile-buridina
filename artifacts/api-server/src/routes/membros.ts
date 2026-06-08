import { Router } from "express";
import { db, membros, votos, usuarios, insertMembroSchema, insertVotoSchema } from "@workspace/db";
import { eq, gt, ilike, or, and, inArray } from "drizzle-orm";

const router = Router();

router.get("/membros", async (req: any, res: any) => {
  try {
    const { aldeiaId, search, updatedAfter, status } = req.query as Record<
      string,
      string | undefined
    >;

    const conditions = [];

    // Filter by status.
    // Default to 'approved' if no status is specified (e.g. for the mobile app)
    if (status && status !== "all") {
      conditions.push(eq(membros.status, status as "pending" | "approved" | "rejected"));
    } else if (!status) {
      conditions.push(eq(membros.status, "approved"));
    }

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

    // Fetch votes for the fetched members to include in response
    if (results.length > 0) {
      const memberIds = results.map((m) => m.id);
      const allVotes = await db
        .select()
        .from(votos)
        .where(inArray(votos.membroId, memberIds));

      const resultsWithVotes = results.map((m) => {
        const memberVotes = allVotes.filter((v) => v.membroId === m.id);
        return {
          ...m,
          votos: memberVotes,
        };
      });

      res.json(resultsWithVotes);
    } else {
      res.json([]);
    }
  } catch (err) {
    req.log.error({ err }, "Failed to list membros");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/membros/:id", async (req: any, res: any) => {
  try {
    const [membro] = await db
      .select()
      .from(membros)
      .where(eq(membros.id, req.params.id));
    if (!membro) {
      res.status(404).json({ error: "Membro not found" });
      return;
    }

    // Include votes
    const memberVotes = await db
      .select()
      .from(votos)
      .where(eq(votos.membroId, membro.id));

    res.json({
      ...membro,
      votos: memberVotes,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get membro");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/membros", async (req: any, res: any) => {
  try {
    const parsed = insertMembroSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid data", details: parsed.error });
      return;
    }

    // Check if there are any active evaluators in the database
    const evaluators = await db.select().from(usuarios).where(eq(usuarios.role, "avaliador"));
    const hasAvaliadores = evaluators.length > 0;

    // Check if creator is a master user
    const userRoleHeader = req.headers["x-user-role"];
    const isMasterCreator = userRoleHeader === "master";

    // "se não tiver mais avaliadores no sistema o cadastro é direto" OR "se o master adicionar, a adição é direta"
    const initialStatus = (!hasAvaliadores || isMasterCreator) ? "approved" : "pending";

    const [created] = await db.insert(membros).values({
      ...parsed.data,
      status: initialStatus,
    }).returning();
    res.status(201).json({ ...created, votos: [] });
  } catch (err) {
    req.log.error({ err }, "Failed to create membro");
    res.status(500).json({ error: "Internal server error" });
  }
});

// Vote endpoint
router.post("/membros/:id/voto", async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const { avaliadorNome, voto } = req.body;

    if (!avaliadorNome || !voto || (voto !== "aprovar" && voto !== "rejeitar")) {
      res.status(400).json({ error: "Invalid vote parameters. Requires avaliadorNome and voto ('aprovar'|'rejeitar')" });
      return;
    }

    // Verify member exists
    const [membro] = await db.select().from(membros).where(eq(membros.id, id));
    if (!membro) {
      res.status(404).json({ error: "Membro not found" });
      return;
    }

    // Check if evaluator already voted
    const [existingVote] = await db
      .select()
      .from(votos)
      .where(and(eq(votos.membroId, id), eq(votos.avaliadorNome, avaliadorNome)));

    if (existingVote) {
      // Update existing vote
      await db
        .update(votos)
        .set({ voto, createdAt: new Date() })
        .where(eq(votos.id, existingVote.id));
    } else {
      // Create new vote
      await db.insert(votos).values({
        membroId: id,
        avaliadorNome,
        voto,
      });
    }

    // Get all votes to decide status
    const allVotes = await db.select().from(votos).where(eq(votos.membroId, id));
    const approvals = allVotes.filter((v) => v.voto === "aprovar").length;
    const rejections = allVotes.filter((v) => v.voto === "rejeitar").length;

    // "se o master aprovar, a adição é direta"
    // Fetch voter's details to check if they have master role
    const [voterUser] = await db
      .select()
      .from(usuarios)
      .where(
        or(
          eq(usuarios.username, avaliadorNome.trim().toLowerCase()),
          eq(usuarios.nome, avaliadorNome.trim())
        )
      );
    const isMasterVoter = voterUser?.role === "master";

    let newStatus = membro.status;
    if (isMasterVoter && voto === "aprovar") {
      newStatus = "approved";
    } else if (approvals >= 2) {
      newStatus = "approved";
    } else if (rejections >= 2) {
      newStatus = "rejected";
    }

    // Update status and updatedAt if changed
    const [updatedMembro] = await db
      .update(membros)
      .set({ status: newStatus, updatedAt: new Date() })
      .where(eq(membros.id, id))
      .returning();

    res.json({
      ...updatedMembro,
      votos: allVotes,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to register vote");
    res.status(500).json({ error: "Internal server error" });
  }
});

// Admin manual status decision
router.post("/membros/:id/decidir", async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || (status !== "approved" && status !== "rejected" && status !== "pending")) {
      res.status(400).json({ error: "Invalid status" });
      return;
    }

    const [updated] = await db
      .update(membros)
      .set({ status, updatedAt: new Date() })
      .where(eq(membros.id, id))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Membro not found" });
      return;
    }

    const memberVotes = await db
      .select()
      .from(votos)
      .where(eq(votos.membroId, id));

    res.json({
      ...updated,
      votos: memberVotes,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to update status");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;

