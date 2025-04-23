import { z } from 'zod';

export const RegisterSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters"),
    email: z.string().email("Email is not valid"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

export const LoginSchema = z.object({
    email: z.string().email("Email is not valid"),
    password: z.string().min(1, "Password is required"),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
