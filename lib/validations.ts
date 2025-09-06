import { z } from "zod"

export const signupSchema = z.object({
  name: z.string().min(3, "Name must be 3+ chars").max(60),
  email: z.string().email("Invalid email").toLowerCase().trim(),
  password: z.string()
    .min(8, "Min 8 characters")
    .max(72, "Max 72")
    .regex(/[A-Z]/, "Add at least 1 uppercase")
    .regex(/[a-z]/, "Add at least 1 lowercase")
    .regex(/\d/, "Add at least 1 number"),
})

export const signinSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  password: z.string().min(8),
})

export const onboardingSchema = z.object({
  industry: z.string().nonempty("Select an industry"),
  subIndustry: z.string().nonempty("Please select a specialization"),
  bio: z.string().max(500).optional(),
  experience: z.string().transform((val) => parseInt(val, 10)).pipe(z.number().min(0, "Experience must be at least 0 years!").max(50, "Experince can't exceed 50 years")),
  skills: z.string().transform((val) => val ? val.split(",").map((skill) => skill.trim()).filter(Boolean) : undefined),

})