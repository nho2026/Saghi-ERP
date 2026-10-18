import { apiClient } from "@/shared/api/client";
export type TaskEmployee = {
  id: string;
  departmentId?: string | null;
  employeeCode: string;
  firstName: string;
  lastName: string;
  hireDate: string;
  status: string;
  isDepartmentLeader?: boolean;
  position?: { name: string };
  department?: { name: string };
  user?: { id: string; name: string; email: string };
};
export type TaskItem = {
  id: string;
  title: string;
  project?: {
    id: string;
    name: string;
    department: { id: string; name: string };
  } | null;
  description: string;
  priority: string;
  status: string;
  startDate: string | null;
  dueDate: string | null;
  estimatedMinutes: number | null;
  completedAt: string | null;
  reviewedAt: string | null;
  reviewNote: string | null;
  reviewedBy?: { id: string; name: string } | null;
  assignees: { assignedAt: string; employee: TaskEmployee }[];
  attachments: {
    id: string;
    fileName: string;
    fileUrl: string;
    mimeType: string;
    fileSize: number;
    createdAt: string;
  }[];
  comments: {
    id: string;
    body: string;
    createdAt: string;
    author: { id: string; name: string };
  }[];
  timeEntries: {
    id: string;
    workDate: string;
    minutes: number;
    note: string | null;
    createdAt: string;
    employee: { id: string; firstName: string; lastName: string };
  }[];
  createdBy: { id: string; name: string };
  createdAt: string;
  updatedAt: string;
};
export type TaskDepartment = {
  id: string;
  name: string;
  projects: TaskProject[];
};
export type TaskProject = {
  id: string;
  name: string;
  description?: string | null;
  departmentId: string;
  department?: { id: string; name: string };
  _count?: { tasks: number };
};
export type TaskPage = {
  items: TaskItem[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};
export type TaskReport = {
  month: string;
  summary: {
    created: number;
    completed: number;
    overdue: number;
    completionRate: number;
    estimatedMinutes: number;
    trackedMinutes: number;
    varianceMinutes: number;
  };
  employees: {
    employeeId: string;
    employeeName: string;
    minutes: number;
    entries: number;
  }[];
};
export const tasksApi = {
  departments: () =>
    apiClient.get<TaskDepartment[]>("/tasks/departments").then((r) => r.data),
  projects: (departmentId: string) =>
    apiClient
      .get<TaskProject[]>("/tasks/projects", { params: { departmentId } })
      .then((r) => r.data),
  createProject: (data: {
    name: string;
    description?: string;
    departmentId: string;
  }) =>
    apiClient.post<TaskProject>("/tasks/projects", data).then((r) => r.data),
  list: (params: Record<string, string | number | undefined>) =>
    apiClient.get<TaskPage>("/tasks", { params }).then((r) => r.data),
  get: (id: string) =>
    apiClient.get<TaskItem>(`/tasks/${id}`).then((r) => r.data),
  employees: () =>
    apiClient.get<TaskEmployee[]>("/tasks/assignees").then((r) => r.data),
  upload: async (files: File[]) => {
    const body = new FormData();
    files.forEach((file) => body.append("files", file));
    return apiClient.post("/tasks/uploads", body).then((r) => r.data);
  },
  create: (data: Record<string, unknown>) =>
    apiClient.post("/tasks", data).then((r) => r.data),
  update: (id: string, data: Record<string, unknown>) =>
    apiClient.patch(`/tasks/${id}`, data),
  remove: (id: string) => apiClient.delete(`/tasks/${id}`),
  report: (month: string) =>
    apiClient
      .get<TaskReport>("/tasks/reports/monthly", { params: { month } })
      .then((r) => r.data),
  addTime: (id: string, data: Record<string, unknown>) =>
    apiClient.post(`/tasks/${id}/time-entries`, data),
};
