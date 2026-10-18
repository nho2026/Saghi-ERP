import { prisma } from "../../../shared/database/client.js";
import { paginate } from "../shared/pagination.model.js";
export const productsModel = {
  imageReferences: async (imageUrl) => {
    if (await prisma.inventoryProductImage.count({ where: { imageUrl } }))
      return true;
    if (
      await prisma.inventoryPurchase.count({
        where: { attachmentUrl: imageUrl },
      })
    )
      return true;
    const orders = await prisma.inventoryOrder.findMany({
      select: { items: true },
    });
    return orders.some(
      ({ items }) =>
        Array.isArray(items) &&
        items.some((item) => item.imageUrl === imageUrl),
    );
  },
  updateSpecial: (id, input) =>
    prisma.$transaction(async (tx) => {
      if (input.variants.length !== 1)
        throw Object.assign(new Error("Edit one product at a time."), {
          status: 400,
        });
      const product = await tx.inventoryProduct.findUnique({ where: { id } });
      if (!product?.isSpecial)
        throw Object.assign(new Error("Special product not found."), {
          status: 404,
        });
      const category = await tx.productCategory.findUnique({
        where: { id: input.categoryId },
      });
      if (!category || category.status !== "active")
        throw Object.assign(new Error("Select an active category."), {
          status: 400,
        });
      const {
        variants: [variant],
        ...fields
      } = input;
      return tx.inventoryProduct.update({
        where: { id },
        data: {
          ...fields,
          sku: variant.code,
          barcode: variant.barcode || null,
          productionCompany: variant.productionCompany,
          costPrice: input.boxPrice,
          sellingPrice: input.specialPrice,
        },
      });
    }),
  createSpecial: (input, db = prisma) =>
    db.$transaction(async (tx) => {
      const category = await tx.productCategory.findUnique({
        where: { id: input.categoryId },
      });
      if (!category || category.status !== "active")
        throw Object.assign(new Error("Select an active category."), {
          status: 400,
        });
      const { variants, ...fields } = input;
      const products = [];
      for (const variant of variants)
        products.push(
          await tx.inventoryProduct.create({
            data: {
              ...fields,
              isSpecial: true,
              sku: variant.code,
              barcode: variant.barcode || null,
              productionCompany: variant.productionCompany,
              costPrice: input.boxPrice,
              sellingPrice: input.specialPrice,
            },
          }),
        );
      return products;
    }),
  paginate,
  create: (...args) => prisma.inventoryProduct.create(...args),
  delete: (...args) => prisma.inventoryProduct.delete(...args),
  findUnique: (...args) => prisma.inventoryProduct.findUnique(...args),
  findUniqueOrThrow: (...args) =>
    prisma.inventoryProduct.findUniqueOrThrow(...args),
  update: (...args) => prisma.inventoryProduct.update(...args),
  deleteImages: (...args) => prisma.inventoryProductImage.deleteMany(...args),
};
