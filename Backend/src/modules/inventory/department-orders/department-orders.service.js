import { departmentOrdersModel as model } from "./department-orders.model.js";
import {
  departmentOrderSchema,
  departmentOrderStatus,
  departmentOrderUpdate,
  departmentOrderComment,
} from "./department-orders.schema.js";
export const departmentOrdersService = {
  departments: () => model.departments(),
  list: ({ query }) =>
    model.list(query, {
      ...(query.departmentId && { departmentId: String(query.departmentId) }),
      ...(query.status && {
        status: departmentOrderStatus.parse(query.status),
      }),
      ...(query.search && {
        OR: ["id", "note"].map((key) => ({
          [key]: { contains: String(query.search).trim() },
        })),
      }),
    }),
  create: async ({ body }) => {
    const input = departmentOrderSchema.parse(body);
    const department = await model.department(input.departmentId);
    if (!department)
      throw Object.assign(new Error("Department not found."), { status: 400 });
    return model.create({
      ...input,
      departmentName: department.name,
      deadline: input.deadline ? new Date(input.deadline) : null,
    });
  },
  update: ({ id, body }) => model.update(id, departmentOrderUpdate.parse(body)),
  comment: ({ id, body }) =>
    model.comment(id, departmentOrderComment.parse(body).note),
  comments: ({ id }) => model.comments(id),
};
