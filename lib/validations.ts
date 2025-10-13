import { email, z } from "zod"

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

export const contactSchema = z.object({
  email: z.string().email("Invalid email address").toLowerCase().trim(),
  mobile: z.string().min(10, "Invalid mobile number").max(15).optional(),
  linkedIn: z.string().optional(),
  twitter: z.string().optional(),
})

export const entrySchema = z.object({
  title: z.string().min(1, "Title is required!"),
  organization: z.string().min(1, "Organization is required!"),
  startDate: z.string().min(1, "Start date is required!"),
  endDate: z.string().optional(),
  description: z.string().min(1, "Description is required!"),
  current: z.boolean().default(false)
}).refine((data) => {
  if (!data.current && !data.endDate) {
    return false;
  }
  return true;
},
  {
    message: "End date is required unless this is your current position",
    path: ['endDate']
  }
)

export const resumeSchema = z.object({
  contactInfo: contactSchema,
  summary: z.string().min(1, "Summary is required!"),
  skills: z.string().min(1, "Skills are required!"),
  experience: z.array(entrySchema),
  education: z.array(entrySchema),
  projects: z.array(entrySchema),
})

export const coverLetterSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  jobTitle: z.string().min(1, "Job title is required"),
  jobDescription: z.string().min(1, "Job description is required"),
});