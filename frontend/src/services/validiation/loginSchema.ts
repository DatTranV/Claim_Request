import { z } from "zod";

export const loginSchema = z.object({
    email: z.string().email("Invalid email!"),
    password: z.string().min(1, "Please fill in your password"),
});
