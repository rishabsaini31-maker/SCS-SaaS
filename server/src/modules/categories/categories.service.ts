import prisma from "../../common/db/prisma";

export const getAllCategories = async () => {
  const products = await prisma.product.findMany({
    where: { category: { not: null } },
    select: { category: true },
    distinct: ["category"],
    orderBy: { category: "asc" },
  });

  return products.map((p) => ({ name: p.category })).filter((c) => c.name);
};
