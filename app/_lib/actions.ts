"use server";
import { redirect } from "next/navigation";
import { loginSchema, signUpschema } from "./validation";
import { ErrorMessages, ErrorCode } from "../_enums";
import { createClient } from "@/app/_utils/supabase/server";
import { revalidatePath } from "next/cache";

export const login = async (formData: FormData): Promise<string | void> => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const domain = formData.get("domain") as string;
  const licenseKey = process.env.LICENSE_KEY as string;
  if (!email || !password) {
    throw new Error(ErrorMessages.default);
  }

  const validatedFields = loginSchema.safeParse({ email, password });
  if (!validatedFields.success) {
    const message = "Invalid inputs, please check your inputs";
    // redirect(`/login?error=${encodeURIComponent(message)}`);
    return message;
  }

  const res: Response = await fetch(`${process.env.NEXT_PUBLIC_SERVER}/auth`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ licenseKey }),
  });

  if (!res.ok) throw new Error(ErrorMessages.default);

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  //setting cookies
  const designation: boolean =
    data?.user?.user_metadata?.designation === "therapist";

  if (!error) {
    const redirectUrl: string = designation ? "/provider" : "/session";

    // return redirectUrl;
    revalidatePath("/", "layout");
    redirect(redirectUrl);
  } else {
    // Type narrowing: make sure error.code is string & matches ErrorMessages keys
    let message = ErrorMessages.default as string;
    if (error?.code && error.code in ErrorMessages) {
      message = ErrorMessages[error.code as ErrorCode];
    }
    // redirect(`/?error=${encodeURIComponent(message)}`);
    return message;
  }
};

//sign up account
type SelectedQuesAnswers = string | Record<string, unknown>;
interface GeoPluginLocation {
  geoplugin_request: string;
  geoplugin_city: string;
  geoplugin_region: string;
  geoplugin_countryName: string;
  [key: string]: any;
}

export async function signup(
  selectedQuesAnswers: SelectedQuesAnswers,
  formData: FormData
): Promise<string | void> {
  const supabase = await createClient();

  const response: Response = await fetch("http://www.geoplugin.net/json.gp");
  const location: GeoPluginLocation = await response.json();

  const options: boolean = typeof selectedQuesAnswers === "string";
  const type: string = options ? (selectedQuesAnswers as string) : "patient";

  const validatedFields = signUpschema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    name: formData.get("name"),
    phone: formData.get("phone"),
  });

  if (!validatedFields.success) {
    // Use a specific error message or a default one
    // redirect(`/?error=${encodeURIComponent(ErrorMessages.invalid_inputs ?? ErrorMessages.default)}`);
    return ErrorMessages.invalid_inputs ?? ErrorMessages.default;
  }

  const { data: signUpData, error } = await supabase.auth.signUp({
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    options: {
      data: {
        full_name: formData.get("name"),
        designation: options ? selectedQuesAnswers : "patient",
      },
    },
  });

  // Handle signup errors with enums
  if (error || !signUpData.user) {
    let message = ErrorMessages.default as string;
    if (error?.code && error.code in ErrorMessages) {
      message = ErrorMessages[error.code as ErrorCode];
    }
    // redirect(`/?error=${encodeURIComponent(message)}`);
    return message;
  }

  const therapistId = 6;

  const userData = {
    user_id: signUpData.user.id,
    name: formData.get("name"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    therapist_id: !options ? therapistId : null,
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
    // redirect(`/?error=${encodeURIComponent(message)}`);
    return message;
  }

  if (options) {
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
  } else {
    const patientsData = {
      patient_id: signUpData.user.id,
      therapist: therapistId,
      name: formData.get("name"),
      email: formData.get("email"),
      selected: JSON.stringify(selectedQuesAnswers),
    };
    await supabase.from("patients").insert([patientsData]);
  }

  revalidatePath("/", "layout");
  redirect(`/verify/${formData.get("email")}?type=${type}`);
}
