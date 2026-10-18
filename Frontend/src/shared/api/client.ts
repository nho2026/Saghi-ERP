import { apiBaseUrl } from "./base-url";
import { hasPermission, storedUser } from "@/features/auth/access";
import { permissionForRequest } from "@/features/auth/permission-policy";
import axios from "axios";
import { toast } from "sonner";
import i18n from "@/i18n";

export const apiClient = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
  headers: { "Content-Type": "application/json", Accept: "application/json" },
  timeout: 15_000,
});

export const apiErrorMessage = (error: unknown) => {
  if (
    !axios.isAxiosError<{
      message?: string;
      errors?: Record<string, string[]>;
    }>(error)
  )
    return "Something went wrong. Please try again.";
  const data = error.response?.data;
  if (error.response?.status === 422 && data?.errors) {
    const details = Object.entries(data.errors).flatMap(([field, messages]) =>
      Array.isArray(messages)
        ? messages.map((message) => `${field}: ${message}`)
        : [],
    );
    if (details.length) return details.join("\n");
  }
  const message =
    data?.message ?? "The server is unavailable. Please try again.";
  if (error.config?.url?.includes("/building-expenses")) {
    const options = {
      ns: "building",
      keySeparator: false as const,
      nsSeparator: false as const,
    };
    if (i18n.exists(message, options)) return i18n.t(message, options);
    if (error.response?.status === 403) return i18n.t("access.denied");
    return i18n.t(
      error.response?.status === 400 || error.response?.status === 422
        ? "Check required fields and entered values."
        : "Unable to complete this action. Please try again.",
      options,
    );
  }
  return message;
};

// Client checks provide immediate feedback; the API independently enforces the same policy.
apiClient.interceptors.request.use((config) => {
  const method = (config.method ?? "get").toUpperCase();
  const permission = permissionForRequest(method, config.url ?? "");
  if (permission && !["GET", "HEAD"].includes(method)) {
    const user = storedUser();
    const view = `${permission.slice(0, permission.lastIndexOf("."))}.view`;
    if (!hasPermission(user, view) || !hasPermission(user, permission)) {
      throw new axios.AxiosError(
        i18n.t("access.denied"),
        "ERR_FORBIDDEN",
        config,
        undefined,
        {
          status: 403,
          statusText: "Forbidden",
          headers: {},
          config,
          data: { message: i18n.t("access.denied") },
        },
      );
    }
  }
  return config;
});

const nonCrudAction =
  /\/(login|logout|sync|test|capture|password|time|checkout|check-in|check-out)(\/|$)|\/pos\/(sales|returns)(\/|$)|\/notifications(\/|$)/i;

apiClient.interceptors.response.use(
  (response) => {
    const method = response.config.method?.toLowerCase();
    const url = response.config.url ?? "";
    if (!nonCrudAction.test(url)) {
      if (method === "post") toast.success(i18n.t("crudToast.created"));
      if (method === "put" || method === "patch")
        toast.success(i18n.t("crudToast.updated"));
      if (method === "delete") toast.success(i18n.t("crudToast.deleted"));
    }
    return response;
  },
  (error) => {
    if (
      !axios.isCancel(error) &&
      !error.response &&
      ["ERR_NETWORK", "ECONNABORTED", "ETIMEDOUT"].includes(error.code)
    ) {
      window.dispatchEvent(new Event("nho:connection-error"));
    }
    const method = error.config?.method?.toLowerCase();
    if (
      !axios.isCancel(error) &&
      ["post", "put", "patch", "delete"].includes(method) &&
      !/\/auth\/login(?:$|\?)/.test(error.config?.url ?? "")
    ) {
      toast.error(apiErrorMessage(error), { id: "api-action-error" });
    }
    return Promise.reject(error);
  },
);
