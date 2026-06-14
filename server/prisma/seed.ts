import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const clickSpeed = await prisma.game.upsert({
    where: { slug: "click-speed" },
    update: {},
    create: {
      slug: "click-speed",
      title: "Click Speed Test",
      description: "Click as fast as you can in 10 seconds! Test your CPS (clicks per second) and compete on the leaderboard.",
      metadata: { type: "click-speed", duration: 10 },
      createdById: (await prisma.user.findFirst({ where: { role: "ADMIN" } }))?.id || (await prisma.user.findFirst())!.id,
    },
  });

  console.log(`Seeded game: ${clickSpeed.title} (${clickSpeed.slug})`);

  const games = [
    { slug: "reaction-time", title: "Reaction Time Test", description: "Test your reflexes. Click as soon as the screen changes color!", metadata: { type: "reaction-time" } },
    { slug: "number-memory", title: "Number Memory Test", description: "Remember the longest number you can. Each round adds another digit!", metadata: { type: "number-memory" } },
  ];

  for (const game of games) {
    const existing = await prisma.game.findUnique({ where: { slug: game.slug } });
    if (!existing) {
      const created = await prisma.game.create({
        data: {
          ...game,
          createdById: (await prisma.user.findFirst({ where: { role: "ADMIN" } }))?.id || (await prisma.user.findFirst())!.id,
        },
      });
      console.log(`Seeded game: ${created.title} (${created.slug})`);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
