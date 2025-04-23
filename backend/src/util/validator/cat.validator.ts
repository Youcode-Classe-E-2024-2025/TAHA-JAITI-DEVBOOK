import { z } from 'zod';

export const CreateCategorySchema = z.object({
    name: z.string().min(1, "name is required"),
    user_id: z.number().int().positive("User ID should be a valid number")
});

export type CreateCatInput = z.infer<typeof CreateCategorySchema>;
