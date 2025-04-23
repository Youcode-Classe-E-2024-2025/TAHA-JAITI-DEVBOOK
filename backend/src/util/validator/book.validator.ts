import { z } from 'zod';

export const CreateBookSchema = z.object({
    title: z.string().min(1, "Title is required"),
    author: z.string().min(1, "Author is required"),
    description: z.string().min(1, "Description is required"),
    cover_path: z.string(),
    pdf_path: z.string(), 
    user_id: z.number().int().positive("User ID should be a valid number")
});

export type CreateBookInput = z.infer<typeof CreateBookSchema>;
