import { prisma } from "../../shared/database/client.js";
import { defaults, schemas } from "./settings.schema.js";
export const isSuperAdmin = (user) =>
  user?.roles?.some(({ role }) => role.name === "Super Administrator");
export async function getSettings(category, db = prisma) {
  const row = await db.systemSetting.findUnique({ where: { category } });
  return { ...defaults[category], ...(row?.value ?? {}) };
}
export async function allSettings() {
  const rows = await prisma.systemSetting.findMany();
  return Object.fromEntries(
    Object.keys(defaults).map((key) => [
      key,
      {
        ...defaults[key],
        ...(rows.find((r) => r.category === key)?.value ?? {}),
      },
    ]),
  );
}
export async function saveSettings(category, value) {
  if (!Object.hasOwn(schemas, category))
    throw Object.assign(new Error("Unknown settings category."), {
      status: 404,
    });
  const parsed = schemas[category].strict().parse(value);
  await prisma.systemSetting.upsert({
    where: { category },
    create: { category, value: parsed },
    update: { value: parsed },
  });
  return parsed;
}
