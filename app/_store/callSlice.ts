"use client";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

/**
 * Type definition for the state of the call slice.
 */
export interface CallState {
  /** Whether a call is currently active */
  inCall: boolean;
  /** Channel identifier or details, can be null if no call is active */
  channel: string | null;
  /** Call type, e.g., "video" or "audio" */
  type: string;
  /** Identifier for the caller, can be null if not set */
  caller: string | null;
  /** Name of the caller, can be null if not set */
  callerName: string | null;
  /** Name of the receiver, can be null if not set */
  receiverName: string | null;
}

/**
 * Type definition for the call action payload.
 */
export interface CallPayload {
  inCall: boolean;
  channel: string | null;
  type: string;
  caller: string | null;
  callerName: string | null;
  receiverName: string | null;
}

/**
 * The initial state for the call slice.
 */
const initialState: CallState = {
  inCall: false,
  channel: null,
  type: "video",
  caller: null,
  callerName: null,
  receiverName: null,
};

/**
 * Redux slice for managing call state in the application.
 * Provides an action to update call details and status.
 */
const callSlice = createSlice({
  name: "call",
  initialState,
  reducers: {
    /**
     * Updates the call state with the provided payload.
     * @param {CallState} state - The current call state.
     * @param {PayloadAction<CallPayload>} action - The incoming action payload.
     */
    call(state: CallState, action: PayloadAction<CallPayload>) {
      state.inCall = action.payload.inCall;
      state.channel = action.payload.channel;
      state.type = action.payload.type;
      state.caller = action.payload.caller;
      state.callerName = action.payload.callerName;
      state.receiverName = action.payload.receiverName;
    },
  },
});

// Export the call action creator
export const { call } = callSlice.actions;

// Export the call reducer for store configuration
export default callSlice.reducer;
