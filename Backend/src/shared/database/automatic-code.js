export const withoutCode = (data, field = "code") => {
  const result = { ...data };
  delete result[field];
  return result;
};
export async function createWithCode(model, args, prefix, field = "code") {
  const rows = await model.findMany({ select: { [field]: true } });
  const pattern = new RegExp(`^${prefix}-([0-9]+)$`);
  let next =
    rows.reduce((max, row) => {
      const match = pattern.exec(row[field] ?? "");
      return match && BigInt(match[1]) > max ? BigInt(match[1]) : max;
    }, 0n) + 1n;
  for (let attempt = 0; attempt < 10; attempt++, next++) {
    try {
      return await model.create({
        ...args,
        data: { ...args.data, [field]: `${prefix}-${next}` },
      });
    } catch (error) {
      if (
        error.code !== "P2002" ||
        !String(error.meta?.target ?? "").includes(field)
      )
        throw error;
    }
  }
  throw Object.assign(
    new Error("Unable to allocate a record code. Please retry."),
    { status: 409 },
  );
}
