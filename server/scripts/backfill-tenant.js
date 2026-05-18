const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const DEFAULT_TENANT = {
  businessName: "shop1",
  ownerName: "System",
  email: "shop1@local.invalid",
  phone: null,
  gstNumber: null,
};

async function tableExists(tableName) {
  const rows = await prisma.$queryRawUnsafe(`
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.tables
      WHERE table_schema = current_schema()
        AND table_name = '${tableName}'
    ) AS exists
  `);
  return Boolean(rows?.[0]?.exists);
}

async function ensureDefaultTenant() {
  const tenant = await prisma.tenant.upsert({
    where: { email: DEFAULT_TENANT.email },
    update: {},
    create: DEFAULT_TENANT,
    select: { id: true },
  });
  return tenant.id;
}

async function backfillTable(tableName, tenantId) {
  if (!(await tableExists(tableName))) return;
  await prisma.$executeRawUnsafe(
    `UPDATE "${tableName}" SET "tenantId" = $1 WHERE "tenantId" IS NULL`,
    tenantId,
  );
}

async function main() {
  const tenantId = await ensureDefaultTenant();

  const tables = [
    "User",
    "Product",
    "Customer",
    "Supplier",
    "Invoice",
    "InvoiceLineItem",
    "Purchase",
    "PurchaseLineItem",
    "Payment",
    "LedgerEntry",
  ];

  for (const table of tables) {
    await backfillTable(table, tenantId);
  }

  console.log(`Backfilled tenantId=${tenantId} to existing data for shop1.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
