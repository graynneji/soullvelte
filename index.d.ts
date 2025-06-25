/**
 * Therapist structure for a User.
 */
export interface Therapist {
  name: string;
  license: string;
  authority: string;
  summary: string;
  therapist_id: string;
  specialization: string;
}

/**
 * UserInfo structure for a patient user.
 */
export interface UserInfo {
  user_id: string;
  name: string;
  therapist_id: number;
  therapist: Therapist;
  patient?: any[]; // Update this to the correct shape if you know it
}

/**
 * User type is an array of UserInfo.
 */
export type User = UserInfo[];

/**
 * structure userId and desgn.
 */
export interface UserID {
  userId?: string;
  desgn?: string;
  error?: string;
}

/**
 * structure patients of therapist.
 */
export interface TherapistPatient {
  id: string;
  name: string;
  therapist: number;
  patient_id: string;
  appointment: string;
  is_subscribed: boolean;
  subscription: unknown;
}

export type Patient = TherapistPatient[];

/**
 * structure Therapist information including wallet info.
 */
export interface TherapistEarnings {
  id: number;
  balance: number;
  pending: number;
  total_earning: number;
}

export type Earnings = TherapistEarnings[];
