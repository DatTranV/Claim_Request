import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email("Invalid email!"),
  password: z.string().min(8),
  fullName: z.string(),
  username: z.string(),
  phone: z.string(),
});
