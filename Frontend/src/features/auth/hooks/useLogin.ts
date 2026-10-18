import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import { clearAuthError, signIn } from "../store/auth.slice";
import type { LoginRequest } from "../types/auth.types";

export function useLogin() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { user, status, error } = useAppSelector((state) => state.auth);

  const login = async (request: LoginRequest) => {
    dispatch(clearAuthError());
    try {
      const authenticatedUser = await dispatch(signIn(request)).unwrap();
      toast.success(t("auth.loginSuccess"));
      return authenticatedUser;
    } catch (cause) {
      const message = typeof cause === "string" ? cause : t("auth.errors.unavailable");
      toast.error(message, { id: "login-error" });
      return null;
    }
  };

  return {
    login,
    isLoading: status === "loading",
    error,
    user,
    clearError: () => dispatch(clearAuthError()),
  };
}
