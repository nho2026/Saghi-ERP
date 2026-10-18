// Price packages independently of the clinical mL/dose instructions.
export function pricePrescriptionItems(items, products, currency) {
  const catalog = new Map(products.map((product) => [product.id, product]));
  return items.map((item) => {
    const product = item.productId ? catalog.get(item.productId) : null;
    if (item.productId && !product)
      throw Object.assign(new Error("Selected medicine is unavailable."), {
        status: 422,
      });
    const unitPrice = product ? product.sellingPrice : item.unitPrice;
    const lineTotal = Math.round(unitPrice * item.quantity * 100) / 100;
    if (
      !Number.isFinite(unitPrice) ||
      unitPrice < 0 ||
      !Number.isFinite(lineTotal)
    ) {
      throw Object.assign(
        new Error("Enter a valid price per bottle/package."),
        { status: 422 },
      );
    }
    return {
      ...item,
      unitPrice,
      lineTotal,
      currency,
      unit: product?.unit || "package",
    };
  });
}
