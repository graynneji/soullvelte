"use server";

import { redirect } from "next/navigation";
import { createClient } from "../_utils/supabase/server";
import { redis } from "../_lib/redis";
import { User, UserID } from "@/index";
import { cache } from "react";
import { LICENSE_KEY } from "../_utils";

const options = {
  method: "GET",
  headers: {
    "Content-Type": "application/json",
    "soullve-license-key": LICENSE_KEY,
  },
};

/**
 * Retrieves the currently authenticated user's ID and designation from Supabase.
 * If the user is not authenticated, redirects to the home page.
 *
 * @returns {Promise<{ userId: string; desgn?: string }>} Object containing the userId and (optionally) designation.
 */
export async function getUserId(): Promise<{ userId: string; desgn?: string }> {
  const supabase = await createClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (!userData?.user) {
    redirect("/");
  }
  const userId: string = userData?.user?.id;
  const desgn: string = userData?.user?.user_metadata?.designation;
  return { userId, desgn };
}

/**
 * Type for cached user data.
 */
export interface UserData {
  userId: string;
  desgn?: string;
}

/**
 * Retrieves the cached user data from Redis.
 * If not present, fetches using getUserId(), caches the result for 24 hours, and returns it.
 *
 * @returns {Promise<UserData>} The cached or freshly-fetched user data.
 */
export async function getCachedUser(): Promise<UserData> {
  // Fetch fresh user data (to use as key)
  const { userId, desgn } = await getUserId();
  const cacheKey = `user:${userId}`;

  // Try to get from Redis cache
  const cached = await redis.get(cacheKey);

  if (cached) {
    let parsed: any;
    if (typeof cached === "string") {
      try {
        parsed = JSON.parse(cached);
      } catch {
        parsed = {};
      }
    } else {
      parsed = cached;
    }
    // Ensure the parsed object has the required userId property
    if (parsed && typeof parsed.userId === "string") {
      // Always return { userId, desgn } shape
      return { userId: parsed.userId, desgn: parsed.desgn };
    }
  }

  const userObj = { userId, desgn };

  await redis.set(cacheKey, JSON.stringify(userObj), { ex: 60 * 60 * 24 });

  return { userId, desgn };
}

/**
 * Clears the cached user data from Redis for the current user.
 * Call this on user sign out to remove their cached data.
 *
 * @returns {Promise<void>}
 */
export async function clearCachedUser(): Promise<void> {
  const { userId } = await getUserId();
  const cacheKey = `user:${userId}`;
  await redis.del(cacheKey);
}

/**
 * Generic API response interface.
 * All API calls return either a `data` property (success) or an `error` property (failure).
 *
 * @template T - The expected data type for the response.
 */
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  [key: string]: any; // for extra fields like desgn, etc.
}

/**
 * Safe fetch wrapper for all API calls.
 * Handles network errors, HTTP errors, and invalid JSON responses.
 *
 * @template T - The expected response data type.
 * @param url - The API endpoint to call (relative or absolute).
 * @param options - Fetch options (method, headers, body, etc).
 * @returns An ApiResponse<T> object with either `data` or `error`.
 */
export async function fetchApi<T>(
  url: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const serverUrl = process.env.SERVER_URL;
  let res: Response;
  try {
    res = await fetch(`${serverUrl}${url}`, options);
  } catch (err) {
    // Network error (e.g., server unavailable, DNS failure)
    return { error: "Network error. Please try again.", err };
  }

  let json: any = null;
  try {
    json = await res.json();
  } catch (err) {
    // Server returned non-JSON (like HTML error page)
    return { error: "Invalid server response." };
  }

  if (!res.ok || json?.error) {
    // HTTP error (4xx/5xx) or API-provided error
    return { error: json?.error || res.statusText, ...json };
  }

  // Successful response
  return { data: json.data ?? json, ...json };
}

/**
 * Fetches user details from the API.
 *
 * @returns ApiResponse containing user data or error message.
 */
export async function fetchUser(): Promise<ApiResponse<User>> {
  const { userId } = await getCachedUser();
  const params = new URLSearchParams({ userId });
  return fetchApi(`/user?${params.toString()}`, options);
}

/**
 * Fetches therapist information for a user.
 *
 * @returns ApiResponse containing therapist info or error message.
 */
export async function fetchTherapistInfo(): Promise<ApiResponse<any>> {
  const { userId, desgn } = await getCachedUser();
  const params = new URLSearchParams({ userId, desgn: desgn! });
  return fetchApi(`/user/therapist/info?${params.toString()}`, options);
}

/**
 * Fetches messages for a user (as sender or receiver).
 *
 * @returns ApiResponse containing messages or error message.
 */
export async function fetchLastMessages(): Promise<ApiResponse<any>> {
  const { userId } = await getCachedUser();
  const params = new URLSearchParams({ userId });
  return fetchApi(`/messages?${params.toString()}`, options);
}

/**
 * Sends a message or initiates a request between two users (sender and receiver).
 *
 * @param users - An object containing the sender's and receiver's unique user IDs.
 * @param users.senderId - The unique ID of the sender.
 * @param users.receiverId - The unique ID of the receiver.
 * @param formData - The form data containing the message or payload to be sent (currently unused in this function).
 * @returns A promise that resolves to an ApiResponse containing the result of the operation or an error message.
 *
 * @remarks
 * - This function makes a POST request to the "/user/appointments" API endpoint.
 * - The request includes the sender and receiver IDs in the request body.
 * - The request uses a license key for authentication in the request headers.
 * - The formData parameter message contains the message to be sent.
 */
export async function sendMessage(
  users: { senderId: string; receiverId: string },
  formData: FormData
): Promise<ApiResponse<any>> {
  const message = formData.get("message") as string;
  if (!users.senderId || !users.receiverId) {
    return { error: "Sender and receiver IDs are required." };
  }
  // Send a POST request to the appointments API with sender and receiver IDs
  return fetchApi("/messages/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "soullve-license-key": LICENSE_KEY,
    },
    body: JSON.stringify({
      senderId: users?.senderId,
      receiverId: users?.receiverId,
      message,
    }),
  });
}

/**
 * Fetches all appointments for a patient with a therapist.
 *
 * @param userId - The patient's unique ID.
 * @param therapistId - The therapist's unique ID.
 * @param licenseKey - The license key for authentication.
 * @returns ApiResponse containing appointments or error message.
 */
export async function fetchAppointments(
  userId: string,
  therapistId: string
): Promise<ApiResponse<any>> {
  const params = new URLSearchParams({ userId, therapistId });
  return fetchApi(`/appointment?${params.toString()}`, options);
}

/**
 * Fetches all appointments for a patient with a therapist.
 *
 * @param userId - The patient's unique ID.
 * @param therapistId - The therapist's unique ID.
 * @param licenseKey - The license key for authentication.
 * @returns ApiResponse containing appointments or error message.
 */
export async function scheduleAppointments(
  {
    userId,
    therapistId,
    color,
  }: { userId: string; therapistId: string; color: string },
  formData: FormData
): Promise<ApiResponse<any>> {
  const title = formData.get("title");
  const start = formData.get("start");
  const event = {
    title,
    start,
    backgroundColor: color,
    borderColor: color,
    patient_id: userId,
    therapist_id: therapistId,
  };
  return fetchApi("/appointment", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "soullve-license-key": LICENSE_KEY,
    },
    body: JSON.stringify(event),
  });
}

/**
 * Fetches all patients attached to a therapist.
 *
 * @returns ApiResponse containing the list of patients or error message.
 */
export async function fetchTherapistPatients(): Promise<ApiResponse<any>> {
  const { userId } = await getCachedUser();
  const params = new URLSearchParams({ userId });
  return fetchApi(`/user/therapist/patients?${params.toString()}`, options);
}

/**
 * Fetches the last N messages exchanged between two users.
 *
 * @param userId - The current user's ID.
 * @param receiverId - The other user's ID.
 * @param limit - The maximum number of messages to fetch (default 30).
 * @returns ApiResponse containing the list of messages or error message.
 */
export async function fetchUserPairMessages(
  userId: string,
  receiverId: string,
  limit: number = 30
): Promise<ApiResponse<any>> {
  const params = new URLSearchParams({
    userId,
    receiverId,
    limit: limit.toString(),
  });

  return fetchApi(`/user/messages/pair?${params.toString()}`, options);
}
