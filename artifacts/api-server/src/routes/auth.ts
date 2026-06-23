import { Router } from "express";
import { db } from "@workspace/db";
import { usuarios } from "@workspace/db";
import { eq } from "drizzle-orm";
import crypto from "crypto";

const router = Router();

let seedingPromise: Promise<void> | null = null;

// Lazy auto-seeding function
async function ensureDefaultUsers() {
  if (seedingPromise) {
    return seedingPromise;
  }
  seedingPromise = (async () => {
    try {
      const existingNew = await db.select().from(usuarios).where(eq(usuarios.username, "master@aldeias.com")).limit(1);
      if (existingNew.length === 0) {
        console.log("Seeding default users: master@aldeias.com, admin@aldeias.com, avaliador@aldeias.com...");
        // Clear old entries if they exist to start clean
        await db.delete(usuarios);
        await db.insert(usuarios).values([
          {
            id: crypto.randomUUID(),
            username: "master@aldeias.com",
            password: "teste123",
            role: "master",
            nome: "Master Administrator",
          },
          {
            id: crypto.randomUUID(),
            username: "admin@aldeias.com",
            password: "teste123",
            role: "admin",
            nome: "Administrador Regional",
          },
          {
            id: crypto.randomUUID(),
            username: "avaliador@aldeias.com",
            password: "teste123",
            role: "avaliador",
            nome: "Avaliador Principal",
          },
        ]);
      }
    } catch (err) {
      console.error("Failed to seed default users:", err);
      // Reset the promise on failure so we can try again on the next request
      seedingPromise = null;
    }
  })();
  return seedingPromise;
}

router.post("/login", async (req: any, res: any) => {
  try {
    // Run lazy seed to make sure users are populated
    await ensureDefaultUsers();

    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({ error: "Username and password required" });
      return;
    }

    const [user] = await db
      .select()
      .from(usuarios)
      .where(eq(usuarios.username, username.trim().toLowerCase()));

    if (!user || user.password !== password) {
      res.status(401).json({ error: "Usuário ou senha incorretos." });
      return;
    }

    // Return user details (omit password)
    res.json({
      id: user.id,
      username: user.username,
      role: user.role,
      nome: user.nome,
    });
  } catch (err) {
    if (req.log) {
      req.log.error({ err }, "Login error");
    } else {
      console.error("Login error:", err);
    }
    res.status(500).json({ error: "Erro interno no servidor." });
  }
});

export default router;
