// import { EmailOtpType } from "@supabase/supabase-js";
// import { NextRequest } from "next/server";
// import { createClient } from "../../utils/supabase/server";
// import { redirect } from "next/navigation";

// export async function GET(request: NextRequest) {
//   const { searchParams } = new URL(request.url);
//   const token_hash = searchParams.get("token_hash");
//   const type = searchParams.get("type") as EmailOtpType | null;
//   const next = searchParams.get("next") ?? "/";

//   let error: unknown = null;

//   if (token_hash && type) {
//     const supabase = createClient();

//     const { error: otpError } = await supabase.auth.verifyOtp({
//       type,
//       token_hash,
//     });
//     error = otpError;
//     if (!error) {
//       // redirect user to specified redirect URL or root of app
//       redirect(next);
//     }
//   }

//   if (error) {
//     console.log(error);
//   }
//   // redirect the user to an error page with some instructions
//   redirect("/error");
// }
