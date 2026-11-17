import { PrismaClient } from "@prisma/client";
import { PRODUCTS, SEED_PROJECTS } from "../lib/data";

const prisma = new PrismaClient();

async function main() {
  for (const [code, percent] of Object.entries({ RONAK20: 20, CUSTOM15: 15, POLISH10: 10 })) {
    await prisma.coupon.upsert({ where: { code }, update: { percent }, create: { code, percent } });
  }
  if ((await prisma.product.count()) === 0) {
    await prisma.product.createMany({
      data: PRODUCTS.map(({ id, images, stock, ...p }) => ({ ...p, images: images ?? [], stock: stock ?? 10 })),
    });
  }
  if ((await prisma.project.count()) === 0) {
    await prisma.project.createMany({ data: SEED_PROJECTS.map(({ id, ...p }) => p) });
  }
  console.log("Seed done");
}
main().finally(() => prisma.$disconnect());
