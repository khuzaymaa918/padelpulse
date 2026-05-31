import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const adapter = new PrismaPg({ connectionString: process.env.DIRECT_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  // ─── Categories ───────────────────────────────────
  const rackets = await prisma.category.upsert({
    where: { slug: "rackets" },
    update: {},
    create: {
      name: "Rackets",
      slug: "rackets",
      description: "Professional padel rackets for all levels",
      sortOrder: 1,
    },
  });

  const balls = await prisma.category.upsert({
    where: { slug: "balls" },
    update: {},
    create: {
      name: "Balls",
      slug: "balls",
      description: "Tournament and training padel balls",
      sortOrder: 2,
    },
  });

  const grips = await prisma.category.upsert({
    where: { slug: "grips" },
    update: {},
    create: {
      name: "Grips",
      slug: "grips",
      description: "Overgrips and replacement grips",
      sortOrder: 3,
    },
  });

  console.log("✓ Categories created");

  // ─── Brands ───────────────────────────────────────
  const bullpadel = await prisma.brand.upsert({
    where: { slug: "bullpadel" },
    update: {},
    create: { name: "Bullpadel", slug: "bullpadel" },
  });

  const head = await prisma.brand.upsert({
    where: { slug: "head" },
    update: {},
    create: { name: "Head", slug: "head" },
  });

  const wilson = await prisma.brand.upsert({
    where: { slug: "wilson" },
    update: {},
    create: { name: "Wilson", slug: "wilson" },
  });

  const nox = await prisma.brand.upsert({
    where: { slug: "nox" },
    update: {},
    create: { name: "Nox", slug: "nox" },
  });

  const adidas = await prisma.brand.upsert({
    where: { slug: "adidas" },
    update: {},
    create: { name: "Adidas", slug: "adidas" },
  });

  const babolat = await prisma.brand.upsert({
    where: { slug: "babolat" },
    update: {},
    create: { name: "Babolat", slug: "babolat" },
  });

  console.log("✓ Brands created");

  // ─── Products ─────────────────────────────────────

  // 1. Bullpadel Vertex 04 Pro
  const vertex = await prisma.product.upsert({
    where: { slug: "bullpadel-vertex-04-pro" },
    update: {},
    create: {
      name: "Vertex 04 Pro",
      slug: "bullpadel-vertex-04-pro",
      description:
        "The Bullpadel Vertex 04 Pro is engineered for advanced and professional players who demand explosive power from the baseline. The diamond-shaped head pushes the sweet spot high, generating maximum pace on every smash. Crafted with a full carbon fiber frame and a Vibradrive system that absorbs shock, it delivers both ferocity and comfort across long rallies.",
      categoryId: rackets.id,
      brandId: bullpadel.id,
      isFeatured: true,
      shape: "Diamond",
      level: "Advanced",
      material: "Carbon Fiber",
      weight: "365-375g",
      balance: "High",
      core: "38mm Multiglass HR3",
    },
  });

  await prisma.productVariant.createMany({
    skipDuplicates: true,
    data: [
      { productId: vertex.id, color: "Midnight Black", gripSize: "L1", sku: "BP-V04-BLK-L1", price: 28500, comparePrice: 33000, stock: 8 },
      { productId: vertex.id, color: "Midnight Black", gripSize: "L2", sku: "BP-V04-BLK-L2", price: 28500, comparePrice: 33000, stock: 12 },
      { productId: vertex.id, color: "Midnight Black", gripSize: "L3", sku: "BP-V04-BLK-L3", price: 28500, comparePrice: 33000, stock: 5 },
      { productId: vertex.id, color: "Arctic White", gripSize: "L2", sku: "BP-V04-WHT-L2", price: 28500, comparePrice: 33000, stock: 7 },
      { productId: vertex.id, color: "Carbon Blue", gripSize: "L2", sku: "BP-V04-BLU-L2", price: 28500, comparePrice: 33000, stock: 4 },
    ],
  });

  await prisma.productImage.createMany({
    skipDuplicates: true,
    data: [
      { productId: vertex.id, url: "https://res.cloudinary.com/demo/image/upload/padelpulse/vertex-04-pro-1.jpg", isPrimary: true, sortOrder: 1 },
    ],
  });

  // 2. Head Delta Pro 2025
  const delta = await prisma.product.upsert({
    where: { slug: "head-delta-pro-2025" },
    update: {},
    create: {
      name: "Delta Pro 2025",
      slug: "head-delta-pro-2025",
      description:
        "The Head Delta Pro 2025 is a round-shaped racket designed for professional players seeking control and precision. Its balanced weight distribution and fiberglass face deliver consistent performance across all court positions.",
      categoryId: rackets.id,
      brandId: head.id,
      isFeatured: true,
      shape: "Round",
      level: "Pro",
      material: "Fiberglass",
      weight: "360-370g",
      balance: "Medium",
      core: "EVA Soft Foam",
    },
  });

  await prisma.productVariant.createMany({
    skipDuplicates: true,
    data: [
      { productId: delta.id, color: "Black/Red", gripSize: "L1", sku: "HD-DP25-BLR-L1", price: 34000, stock: 6 },
      { productId: delta.id, color: "Black/Red", gripSize: "L2", sku: "HD-DP25-BLR-L2", price: 34000, stock: 10 },
      { productId: delta.id, color: "Black/Red", gripSize: "L3", sku: "HD-DP25-BLR-L3", price: 34000, stock: 4 },
    ],
  });

  await prisma.productImage.createMany({
    skipDuplicates: true,
    data: [
      { productId: delta.id, url: "https://res.cloudinary.com/demo/image/upload/padelpulse/delta-pro-2025-1.jpg", isPrimary: true, sortOrder: 1 },
    ],
  });

  // 3. Nox ML10 Luxury
  const noxML = await prisma.product.upsert({
    where: { slug: "nox-ml10-luxury" },
    update: {},
    create: {
      name: "ML10 Luxury",
      slug: "nox-ml10-luxury",
      description:
        "The Nox ML10 Luxury brings together a teardrop shape with a mid-high balance for players transitioning from intermediate to advanced. Excellent power-control ratio at a competitive price.",
      categoryId: rackets.id,
      brandId: nox.id,
      isFeatured: true,
      shape: "Teardrop",
      level: "Intermediate",
      material: "Carbon/Fiberglass",
      weight: "355-365g",
      balance: "Medium-High",
      core: "HR3 Foam",
    },
  });

  await prisma.productVariant.createMany({
    skipDuplicates: true,
    data: [
      { productId: noxML.id, color: "Black/Gold", gripSize: "L2", sku: "NOX-ML10-BG-L2", price: 21250, comparePrice: 25000, stock: 9 },
      { productId: noxML.id, color: "Black/Gold", gripSize: "L3", sku: "NOX-ML10-BG-L3", price: 21250, comparePrice: 25000, stock: 5 },
    ],
  });

  // 4. Wilson Carbon Force Pro
  const carbonForce = await prisma.product.upsert({
    where: { slug: "wilson-carbon-force-pro" },
    update: {},
    create: {
      name: "Carbon Force Pro",
      slug: "wilson-carbon-force-pro",
      description:
        "Wilson's Carbon Force Pro delivers exceptional power with its diamond-shaped full carbon frame. Built for advanced players who want maximum speed on attacking shots.",
      categoryId: rackets.id,
      brandId: wilson.id,
      isFeatured: false,
      shape: "Diamond",
      level: "Advanced",
      material: "Carbon Fiber",
      weight: "370-380g",
      balance: "High",
      core: "EVA Performance",
    },
  });

  await prisma.productVariant.createMany({
    skipDuplicates: true,
    data: [
      { productId: carbonForce.id, color: "Black/Silver", gripSize: "L1", sku: "WIL-CFP-BS-L1", price: 31000, stock: 7 },
      { productId: carbonForce.id, color: "Black/Silver", gripSize: "L2", sku: "WIL-CFP-BS-L2", price: 31000, stock: 11 },
      { productId: carbonForce.id, color: "Black/Silver", gripSize: "L3", sku: "WIL-CFP-BS-L3", price: 31000, stock: 3 },
    ],
  });

  // 5. Adidas Metalbone 3.3
  const metalbone = await prisma.product.upsert({
    where: { slug: "adidas-metalbone-3-3" },
    update: {},
    create: {
      name: "Metalbone 3.3",
      slug: "adidas-metalbone-3-3",
      description:
        "The Adidas Metalbone 3.3 is the weapon of choice for players at the highest level. Full carbon construction with a diamond head delivers unmatched power and a high sweet spot.",
      categoryId: rackets.id,
      brandId: adidas.id,
      isFeatured: true,
      shape: "Diamond",
      level: "Pro",
      material: "Carbon Fiber",
      weight: "365-375g",
      balance: "High",
      core: "EVA High Memory",
    },
  });

  await prisma.productVariant.createMany({
    skipDuplicates: true,
    data: [
      { productId: metalbone.id, color: "Black/White", gripSize: "L2", sku: "ADI-MB33-BW-L2", price: 42000, stock: 5 },
      { productId: metalbone.id, color: "Black/White", gripSize: "L3", sku: "ADI-MB33-BW-L3", price: 42000, stock: 3 },
    ],
  });

  // 6. Babolat Technical Viper
  const viper = await prisma.product.upsert({
    where: { slug: "babolat-technical-viper" },
    update: {},
    create: {
      name: "Technical Viper",
      slug: "babolat-technical-viper",
      description:
        "The Babolat Technical Viper is a teardrop-shaped racket offering excellent versatility for intermediate players. Lightweight and maneuverable with a forgiving sweet spot.",
      categoryId: rackets.id,
      brandId: babolat.id,
      isFeatured: false,
      shape: "Teardrop",
      level: "Intermediate",
      material: "Fiberglass",
      weight: "350-360g",
      balance: "Medium",
      core: "EVA Soft",
    },
  });

  await prisma.productVariant.createMany({
    skipDuplicates: true,
    data: [
      { productId: viper.id, color: "Black/Yellow", gripSize: "L2", sku: "BAB-TV-BY-L2", price: 18000, comparePrice: 20000, stock: 8 },
      { productId: viper.id, color: "Black/Yellow", gripSize: "L3", sku: "BAB-TV-BY-L3", price: 18000, comparePrice: 20000, stock: 6 },
    ],
  });

  // 7. Wilson Premier Balls
  const wilsonBalls = await prisma.product.upsert({
    where: { slug: "wilson-premier-tournament-balls" },
    update: {},
    create: {
      name: "Premier Tournament Balls",
      slug: "wilson-premier-tournament-balls",
      description:
        "Wilson Premier Tournament Balls are the official ball of choice for competitive padel. Pressurized for consistent bounce and durability across match play.",
      categoryId: balls.id,
      brandId: wilson.id,
      isFeatured: true,
    },
  });

  await prisma.productVariant.createMany({
    skipDuplicates: true,
    data: [
      { productId: wilsonBalls.id, sku: "WIL-BALL-PREM-3", price: 1800, stock: 50 },
    ],
  });

  // 8. Head Pro S Balls
  const headBalls = await prisma.product.upsert({
    where: { slug: "head-pro-s-padel-balls" },
    update: {},
    create: {
      name: "Pro S Padel Balls",
      slug: "head-pro-s-padel-balls",
      description:
        "Head Pro S Balls are ideal for training and recreational play. Consistent feel and durable construction for extended use on all court surfaces.",
      categoryId: balls.id,
      brandId: head.id,
      isFeatured: false,
    },
  });

  await prisma.productVariant.createMany({
    skipDuplicates: true,
    data: [
      { productId: headBalls.id, sku: "HD-BALL-PROS-3", price: 1500, stock: 40 },
    ],
  });

  // 9. Bullpadel GB 1900 Overgrip
  const overgrip = await prisma.product.upsert({
    where: { slug: "bullpadel-gb-1900-overgrip" },
    update: {},
    create: {
      name: "GB 1900 Overgrip",
      slug: "bullpadel-gb-1900-overgrip",
      description:
        "The Bullpadel GB 1900 Overgrip offers superior tackiness and sweat absorption. Pack of 3 overgrips in classic white — the go-to choice for players who want a fresh feel every match.",
      categoryId: grips.id,
      brandId: bullpadel.id,
      isFeatured: true,
    },
  });

  await prisma.productVariant.createMany({
    skipDuplicates: true,
    data: [
      { productId: overgrip.id, color: "White", sku: "BP-GB1900-WHT-3PK", price: 950, stock: 60 },
      { productId: overgrip.id, color: "Black", sku: "BP-GB1900-BLK-3PK", price: 950, stock: 45 },
    ],
  });

  // ─── Promo Codes ──────────────────────────────────
  await prisma.promoCode.upsert({
    where: { code: "PADEL10" },
    update: {},
    create: {
      code: "PADEL10",
      description: "10% off your first order",
      discountType: "PERCENTAGE",
      discountValue: 10,
      minOrderAmount: 5000,
      maxUses: 100,
      isActive: true,
    },
  });

  await prisma.promoCode.upsert({
    where: { code: "PULSE500" },
    update: {},
    create: {
      code: "PULSE500",
      description: "Rs. 500 off orders above Rs. 10,000",
      discountType: "FIXED",
      discountValue: 500,
      minOrderAmount: 10000,
      maxUses: 50,
      isActive: true,
    },
  });

  await prisma.promoCode.upsert({
    where: { code: "WELCOME" },
    update: {},
    create: {
      code: "WELCOME",
      description: "15% welcome discount",
      discountType: "PERCENTAGE",
      discountValue: 15,
      minOrderAmount: 3000,
      isActive: true,
    },
  });

  console.log("✓ Products, variants and promo codes created");
  console.log("✅ Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
