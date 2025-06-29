"use server";
import { redirect } from "next/navigation";
import { loginSchema, signUpschema } from "./validation";
import { ErrorMessages, ErrorCode } from "../_enums";
import { createClient } from "@/app/_utils/supabase/server";
import { revalidatePath } from "next/cache";
import { clearCachedUser } from "./services";

/**
 * Logs in a user with the provided form data.
 * Validates the email and password, authenticates with the backend, and redirects based on user role.
 * Returns an error message string if authentication fails.
 *
 * @param {FormData} formData - The form data containing email, password, and domain.
 * @returns {Promise<string | void>} Returns void if redirected, or an error message string on failure.
 */
export const login = async (formData: FormData): Promise<string | {}> => {
  try {
    // Extract credentials and domain from the form data
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const domain = formData.get("domain") as string;
    const licenseKey = process.env.LICENSE_KEY as string;
    if (!email || !password) {
      return { error: ErrorMessages.default };
    }

    // Validate form fields using schema
    const validatedFields = loginSchema.safeParse({ email, password });
    if (!validatedFields.success) {
      const message = "Invalid inputs, please check your inputs";
      return { error: message };
    }

    // Authenticate with the backend server using license key
    const res: Response = await fetch(`${process.env.SERVER_URL}/auth`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ licenseKey }),
    });

    if (!res.ok) return { error: ErrorMessages.default };

    // Sign in with Supabase Auth
    const supabase = await createClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    // Determine user role (therapist or patient)
    const designation: boolean =
      data?.user?.user_metadata?.designation === "therapist";

    if (!error) {
      // const redirectUrl: string = designation ? "/provider" : "/session";

      // Revalidate cache and redirect
      // revalidatePath("/", "layout");
      // redirect(redirectUrl);
      return { redirectUrl: designation ? "/provider" : "/session" };
    } else {
      // Return specific error message if available
      let message = ErrorMessages.default as string;
      if (error?.code && error.code in ErrorMessages) {
        message = ErrorMessages[error.code as ErrorCode];
      }
      return { error: message };
    }
  } catch (err) {
    return { error: "Network error. Please try again later." };
  }
};

/**Sign Up Account **/

/**
 * Interface for answers when patient is signing up.
 */
export interface SelectedQuesAnswersPatient {
  age: string;
  gender: string;
  issues: string;
  therapist_gender: string;
  session_type: string;
  frequency: string;
}

/**
 * Type for selected answers, which could be a string (therapist role) or patient object.
 */
export type SelectedQuesAnswers = string | SelectedQuesAnswersPatient;

/**
 * Represents location data structure from GeoPlugin API.
 */
interface GeoPluginLocation {
  geoplugin_request: string;
  geoplugin_city: string;
  geoplugin_region: string;
  geoplugin_countryName: string;
  [key: string]: any;
}

/**
 * Type guard to check if answers are of patient type.
 * @param obj - The SelectedQuesAnswers object.
 * @returns True if patient answers, false otherwise.
 */
function isPatientAnswers(
  obj: SelectedQuesAnswers
): obj is SelectedQuesAnswersPatient {
  return typeof obj === "object" && obj !== null && "therapist_gender" in obj;
}

/**
 * Signs up a new user, either as a patient or therapist.
 * - Validates form data.
 * - Fetches location information.
 * - Registers the user with Supabase Auth.
 * - Stores additional patient/therapist details in the database.
 * - Selects a therapist for patients based on their preferences.
 * - Redirects to verification page upon successful signup.
 *
 * @param {SelectedQuesAnswers} selectedQuesAnswers - The user's selected answers for signup.
 * @param {FormData} formData - The signup form data.
 * @returns {Promise<string | void>} Returns void if redirected, or an error message string on failure.
 */
export async function signup(
  selectedQuesAnswers: SelectedQuesAnswers,
  formData: FormData
): Promise<string | {}> {
  try {
    // Get location info from GeoPlugin API
    const response = await fetch("http://www.geoplugin.net/json.gp");
    const location: GeoPluginLocation = await response.json();
    const domain = formData.get("domain") as string;
    const licenseKey = process.env.LICENSE_KEY as string;

    // Validate form fields using schema
    const validatedFields = signUpschema.safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
      name: formData.get("name"),
      phone: formData.get("phone"),
    });

    if (!validatedFields.success) {
      return { error: ErrorMessages.invalid_inputs };
    }
    // Authenticate with the backend server using license key
    const res: Response = await fetch(`${process.env.SERVER_URL}/auth`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ licenseKey }),
    });

    if (!res.ok) return { error: ErrorMessages.default };
    // Register with Supabase Auth
    const supabase = await createClient();

    const { data: signUpData, error } = await supabase.auth.signUp({
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      options: {
        data: {
          full_name: formData.get("name"),
          designation: isPatientAnswers(selectedQuesAnswers)
            ? "patient"
            : selectedQuesAnswers,
        },
      },
    });

    if (error || !signUpData.user) {
      let message = ErrorMessages.default as string;
      if (error?.code && error.code in ErrorMessages) {
        message = ErrorMessages[error.code as ErrorCode];
      }
      return { error: message };
    }

    let therapistId: number | null = null;

    // ----- PATIENT SIGNUP LOGIC -----
    if (isPatientAnswers(selectedQuesAnswers)) {
      // Therapist gender preference mapping
      const genderMap: Record<string, string> = {
        "Male therapist": "male",
        "Female therapist": "female",
        "Non-binary therapist": "non-binary",
        "No preference": "",
      };
      const preferredGender =
        genderMap[selectedQuesAnswers.therapist_gender] || "";

      let selectedTherapist = null;

      // Try to find a matching therapist by preferred gender
      if (preferredGender) {
        const { data: matchingTherapists } = await supabase
          .from("therapist")
          .select("id")
          .eq("gender", preferredGender);

        if (matchingTherapists && matchingTherapists.length > 0) {
          const randomIndex = Math.floor(
            Math.random() * matchingTherapists.length
          );
          selectedTherapist = matchingTherapists[randomIndex];
        }
      }

      // Fallback: pick any available therapist if no match found
      if (!selectedTherapist) {
        const { data: allTherapists } = await supabase
          .from("therapist")
          .select("id");
        if (allTherapists && allTherapists.length > 0) {
          const randomIndex = Math.floor(Math.random() * allTherapists.length);
          selectedTherapist = allTherapists[randomIndex];
        }
      }

      therapistId = selectedTherapist?.id ?? null;

      // Save patient user info in "user" table
      const userData = {
        user_id: signUpData.user.id,
        name: formData.get("name"),
        phone: formData.get("phone"),
        email: formData.get("email"),
        therapist_id: therapistId,
        ip: location.geoplugin_request,
        city: location.geoplugin_city,
        region: location.geoplugin_region,
        country: location.geoplugin_countryName,
      };
      const { error: InsertError } = await supabase
        .from("user")
        .insert([userData])
        .select();

      if (InsertError) {
        let message =
          InsertError.code && InsertError.code in ErrorMessages
            ? ErrorMessages[InsertError.code as ErrorCode]
            : ErrorMessages.default;
        return { error: message };
      }

      // Save patient details in "patients" table
      const patientsData = {
        patient_id: signUpData.user.id,
        therapist: therapistId,
        name: formData.get("name"),
        email: formData.get("email"),
        selected: JSON.stringify(selectedQuesAnswers),
      };
      await supabase.from("patients").insert([patientsData]);
    } else {
      // ----- THERAPIST SIGNUP LOGIC -----
      // Save therapist user info in "user" table, no therapist_id
      const userData = {
        user_id: signUpData.user.id,
        name: formData.get("name"),
        phone: formData.get("phone"),
        email: formData.get("email"),
        therapist_id: null,
        ip: location.geoplugin_request,
        city: location.geoplugin_city,
        region: location.geoplugin_region,
        country: location.geoplugin_countryName,
      };
      const { error: InsertError } = await supabase
        .from("user")
        .insert([userData])
        .select();

      if (InsertError) {
        let message =
          InsertError.code && InsertError.code in ErrorMessages
            ? ErrorMessages[InsertError.code as ErrorCode]
            : ErrorMessages.default;
        return { error: message };
      }

      // Save therapist details in "therapist" table
      const therapistData = {
        therapist_id: signUpData.user.id,
        name: formData.get("name"),
        email: formData.get("email"),
        license: formData.get("license"),
        authority: formData.get("authority"),
        gender: formData.get("gender"),
        dob: formData.get("dob"),
        specialization: formData.get("specialization"),
      };
      await supabase.from("therapist").insert([therapistData]);
    }

    // Revalidate and redirect to verification page
    // revalidatePath("/", "layout");
    // redirect(
    //   `/verify?email=${formData.get("email")}&type=${
    //     isPatientAnswers(selectedQuesAnswers) ? "patient" : selectedQuesAnswers
    //   }`
    // );

    return {
      redirectUrl: `/verify?email=${formData.get("email")}&type=${
        isPatientAnswers(selectedQuesAnswers) ? "patient" : selectedQuesAnswers
      }`,
    };
  } catch (err) {
    return { error: "Network error. Please try again later." };
  }
}

/**
 * Signs the current user out using Supabase authentication and redirects to the login page.
 * If an error occurs, returns an error message string.
 *
 * @async
 * @returns {Promise<void | string>} Returns void on success, or an error message string on failure.
 */
export async function signOut(): Promise<void | string> {
  //Clear all cache from redis
  await clearCachedUser();
  // Create a new Supabase client instance (server-side)
  const supabase = await createClient();
  try {
    // Attempt to sign out the user
    await supabase.auth.signOut();

    // Optionally revalidate the root layout if needed
    // revalidatePath("/", "layout");

    // Redirect to the login page after sign out
    redirect(`/login`);
  } catch (error) {
    // Return an error message if sign-out fails
    return `Error signing out: ${error}`;
  }
}
