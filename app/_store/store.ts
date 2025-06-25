"use client";
import { configureStore } from "@reduxjs/toolkit";
import selectedPatientIdReducer from "./selectedPatientIdSlice";
import callReducer from "./callSlice";

const store = configureStore({
  reducer: {
    selectedPatientId: selectedPatientIdReducer,
    call: callReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
