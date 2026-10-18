import { employeePortalModel } from "./employee-portal.model.js";

export const employeePortalService = {
  myTasks: async ({ user }) => {
    if (!user.employee?.id) return [];
    return employeePortalModel.findTasks(user.employee.id);
  },
  ideas: async ({ user }) => employeePortalModel.findIdeas(user.id),
  createIdea: async ({ user, body }) =>
    employeePortalModel.createIdea({
      ...body,
      userId: user.id,
    }),
  warnings: async ({ user }) => employeePortalModel.findWarnings(user.id),
};
