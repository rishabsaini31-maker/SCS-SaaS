import prisma from "../../common/db/prisma";
import { CustomError } from "../../common/errors/CustomError";

import { tenantWhere } from "../../common/tenant/tenant.utils";

function normalizeCategoryName(name: string) {
  return name.trim().replace(/\s+/g, " ");
}

export const getAllCategories = async (tenantId?: string) => {
  const [categories, productCategories] = await Promise.all([
    prisma.category.findMany({
      where: tenantWhere(tenantId),
      select: { name: true },
      orderBy: { name: "asc" },
    }),
    prisma.product.findMany({
      where: {
        ...tenantWhere(tenantId),
        category: { not: null },
      },
      select: { category: true },
      distinct: ["category"],
      orderBy: { category: "asc" },
    }),
  ]);

  const merged = new Set<string>();
  for (const category of categories) {
    merged.add(category.name);
  }
  for (const productCategory of productCategories) {
    if (productCategory.category) {
      merged.add(productCategory.category);
    }
  }

  return Array.from(merged)
    .sort((a, b) => a.localeCompare(b))
    .map((name) => ({ name }));
};

export const createCategory = async (name: string, tenantId?: string) => {
  const categoryName = normalizeCategoryName(name);
  if (!categoryName) {
    throw new CustomError("Category name is required", 400);
  }
  if (!tenantId) {
    throw new CustomError("Tenant context required", 403);
  }

  const category = await prisma.category.upsert({
    where: {
      tenantId_name: {
        tenantId,
        name: categoryName,
      },
    },
    update: {},
    create: {
      tenantId: tenantId ?? null,
      name: categoryName,
    },
  });

  return { name: category.name };
};

export const deleteCategory = async (
  categoryName: string,
  tenantId?: string,
) => {
  const category = normalizeCategoryName(categoryName);
  if (!category) {
    return 0;
  }

  const [categoryResult, productResult] = await Promise.all([
    prisma.category.deleteMany({
      where: tenantWhere(tenantId, { name: category }),
    }),
    prisma.product.updateMany({
      where: tenantWhere(tenantId, { category }),
      data: { category: null },
    }),
  ]);

  return categoryResult.count + productResult.count;
};
