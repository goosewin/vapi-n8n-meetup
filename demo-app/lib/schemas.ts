import { z } from "zod";

export const leadFormSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number (use format: +1234567890)"),
    company: z.string().min(2, "Company name must be at least 2 characters"),
});

export type LeadFormData = z.infer<typeof leadFormSchema>;

