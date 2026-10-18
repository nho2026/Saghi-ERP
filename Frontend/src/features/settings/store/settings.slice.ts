import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Settings } from "../settings";

const settingsSlice = createSlice({
  name: "settings",
  initialState: null as Settings | null,
  reducers: {
    settingsLoaded: (_state, action: PayloadAction<Settings>) => action.payload,
  },
});

export const { settingsLoaded } = settingsSlice.actions;
export const settingsReducer = settingsSlice.reducer;
