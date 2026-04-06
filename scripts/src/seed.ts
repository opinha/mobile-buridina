import { db } from "@workspace/db";
import { aldeias, membros } from "@workspace/db";

async function seed() {
  console.log("Seeding database...");

  const [a1, a2] = await db
    .insert(aldeias)
    .values([
      {
        nome: "Aldeia Arapó",
        descricao: "Aldeia tradicional da região norte",
        localizacao: "Região Norte",
      },
      {
        nome: "Aldeia Tupà",
        descricao: "Aldeia dos guardiões da floresta",
        localizacao: "Região Sul",
      },
    ])
    .returning();

  if (a1) {
    await db.insert(membros).values([
      {
        aldeiaId: a1.id,
        nomeEtnico: "Akaié",
        nomeSocial: "João Silva",
        endereco: "Rua das Palmeiras, 123",
      },
      {
        aldeiaId: a1.id,
        nomeEtnico: "Yuari",
        nomeSocial: "Maria Souza",
        endereco: "Caminho das Flores, 45",
      },
    ]);
  }

  if (a2) {
    await db.insert(membros).values([
      {
        aldeiaId: a2.id,
        nomeEtnico: "Tupinambá",
        nomeSocial: "Carlos Dias",
        endereco: "Estrada Real, 89",
      },
    ]);
  }

  console.log("Seed complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
