import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { loginUser } from "../api/auth.api";
import type { AuthUser, LoginRequest } from "../types/auth.types";

function readStoredUser(): AuthUser | null {
  try {
    const raw = sessionStorage.getItem("nho-current-user");
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

type AuthState = {
  user: AuthUser | null;
  status: "idle" | "loading" | "failed";
  error: string | null;
};

const initialState: AuthState = {
  user: readStoredUser(),
  status: "idle",
  error: null,
};

export const signIn = createAsyncThunk<
  AuthUser,
  LoginRequest,
  { rejectValue: string }
>("auth/signIn", async (request, { rejectWithValue }) => {
  try {
    const user = (await loginUser(request)).user;
    sessionStorage.setItem("nho-current-user", JSON.stringify(user));
    return user;
  } catch (error) {
    return rejectWithValue(
      error instanceof Error ? error.message : "Unable to sign in.",
    );
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthenticatedUser(state, action: { payload: AuthUser }) {
      state.user = action.payload;
      state.error = null;
      state.status = "idle";
    },
    clearAuthError(state) {
      state.error = null;
    },
    clearAuth(state) {
      state.user = null;
      state.error = null;
      state.status = "idle";
    },
  },
  extraReducers(builder) {
    builder
      .addCase(signIn.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(signIn.fulfilled, (state, action) => {
        state.status = "idle";
        state.user = action.payload;
      })
      .addCase(signIn.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? "Unable to sign in.";
      });
  },
});

export const { clearAuth, clearAuthError, setAuthenticatedUser } =
  authSlice.actions;
export const authReducer = authSlice.reducer;
