import Model from "./Model";

export interface BookType {
    id?: number;
    title: string;
    author: string;
    category_id: number;
    user_id: number;
    pdf_path: string;
    cover_path: string;
    created_at?: string;
    updated_at?: string;
}

class Book extends Model<BookType>{

    constructor(){
        super('books');
    }



}

export default Book;