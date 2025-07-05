import { NextResponse } from "next/server";
import { createClient } from "@/app/_utils/supabase/client";

export async function GET() {
  const supabase = createClient();
  try {
    const settings = {
      minBookingLength: 0,
      maxBookingLength: 8,
      maxGuestsPerBooking: 4000,
      breakfastPrice: 9000,
    };
    // Lightweight harmless ping
    // const { error } = await supabase.from("settings").insert([settings]);
    const { error } = await supabase.from("patients").select("id").limit(1);

    if (error) {
      console.error("Supabase ping failed:", error);
      return NextResponse.json(
        { status: "error", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ status: "success", message: "Supabase pinged" });
  } catch (err) {
    console.error("Ping Exception:", err);
    return NextResponse.json(
      { status: "error", details: String(err) },
      { status: 500 }
    );
  }
}
