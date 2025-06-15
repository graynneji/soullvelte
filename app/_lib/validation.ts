import { z } from "zod";

export const signUpschema = z.object({
  name: z
    .string({
      invalid_type_error: "Name is required and more than 3 characters",
    })
    .min(3, "Name should be more than 3 characters"),
  email: z
    .string({
      invalid_type_error: "Valid email is required",
    })
    .email("Please enter a valid email"),
  phone: z
    .string({
      invalid_type_error: "Valid phone is required",
    })
    .regex(
      /^(\+\d{1,3}[-\s]?)?\(?\d{3}\)?[-\s.]?\d{3}[-\s.]?\d{4,7}$/,
      "Please enter a valid phone"
    ),
  password: z
    .string({
      invalid_type_error: "Password must be at least 6 characters",
    })
    .min(6, "Password must be at least 6 characters"),
});

export const loginSchema = z.object({
  email: z
    .string({
      invalid_type_error: "Valid email is required",
    })
    .email("Please enter a valid email"),

  password: z
    .string({
      invalid_type_error: "Password must be at least 6 characters",
    })
    .min(6, "Password must be at least 6 characters"),
});
