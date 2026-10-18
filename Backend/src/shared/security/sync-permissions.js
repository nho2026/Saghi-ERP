import { prisma } from "../database/client.js";
import { permissionCatalog } from "./access-policy.js";

// Only add/update catalog entries. Never reset role grants or seed business data.
export async function syncPermissionCatalog() {
  await prisma.$transaction(
    permissionCatalog.map(({ key, name, module }) =>
      prisma.permission.upsert({
        where: { key },
        create: { key, name, module },
        update: { name, module },
      }),
    ),
  );
}
