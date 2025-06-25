"use client";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define the type for the payload object
export interface SelectedPatientPayload {
  // selectedPatient: any;
  patientId: string;
  patientName: string;
}

// Type for slice state
export interface SelectedPatientIdState {
  selectedPatient: SelectedPatientPayload | null;
}

const initialState: SelectedPatientIdState = {
  selectedPatient: null,
};

const selectedPatientIdSlice = createSlice({
  name: "selectedPatientId",
  initialState,
  reducers: {
    setSelectedPatientId(state, action: PayloadAction<SelectedPatientPayload>) {
      state.selectedPatient = action.payload;
    },
  },
});

export const { setSelectedPatientId } = selectedPatientIdSlice.actions;

export default selectedPatientIdSlice.reducer;
