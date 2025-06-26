import z from 'zod'

export const userCreateSchema = z.object({
  fullName: z.string().optional(),
  username: z
    .string(),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

export const userLoginSchema = z.object({
  email: z.string(),
  password: z.string(),
});