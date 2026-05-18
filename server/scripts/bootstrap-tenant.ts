import dotenv from "dotenv";
import prisma from "../src/common/db/prisma";
import { bootstrapTenant } from "../src/modules/tenant/tenant.service";
import { createTenantSchema } from "../src/modules/tenant/tenant.schema";

dotenv.config();

type ArgMap = Record<string, string>;

function parseArgs(argv: string[]): ArgMap {
  return argv.reduce<ArgMap>((accumulator, current) => {
    if (!current.startsWith("--")) return accumulator;

    const [key, ...valueParts] = current.slice(2).split("=");
    if (!key) return accumulator;

    accumulator[key] = valueParts.join("=");
    return accumulator;
  }, {});
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const payload = createTenantSchema.parse({
    businessName: args.businessName,
    ownerName: args.ownerName,
    email: args.email,
    password: args.password,
    phone: args.phone || undefined,
    gstNumber: args.gstNumber || undefined,
  });

  const tenant = await bootstrapTenant(payload);

  console.log("Tenant bootstrap complete");
  console.log(`Tenant ID: ${tenant.id}`);
  console.log(`Business: ${payload.businessName}`);
  console.log(`Owner email: ${payload.email}`);
  console.log(`Invoice prefix: INV-`);
}

main()
  .catch((error) => {
    console.error("Tenant bootstrap failed");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
