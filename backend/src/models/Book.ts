export interface Book {
    id?: number;
    title: string;
    author: string;
    category_id: number;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    status: 'to-read' | 'in-progress' | 'completed';
    publication_date: Date;
    created_at?: Date;
    updated_at?: Date;
}