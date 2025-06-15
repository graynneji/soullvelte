export enum UserDesignation {
  PATIENT = "patient",
  THERAPIST = "therapist",
}

export enum AppRoute {
  LOGIN = "/",
  AUTH = "/auth",
  SESSION = "/session",
  PROVIDER = "/provider",
  GET_STARTED = "/get-started",
}

// ErrorMessages enum or object
export const ErrorMessages = {
  email_not_confirmed: "Please confirm your email",
  invalid_credentials: "Invalid email and password",
  invalid_inputs: "Invalid inputs, please check your inputs",
  default: "Something went wrong, try again",
} as const;

export type ErrorCode = keyof typeof ErrorMessages;
