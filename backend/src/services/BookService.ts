import Book, { type BookType } from "../models/Book";
import { validateBookData } from "../util/validator";
import { CreateBookSchema, type CreateBookInput } from "../util/validator/book.validator";

const model = new Book();

class BookService {

    static async all() {
        return await model.all();
    }

    static async create(data: CreateBookInput) {
        const parsed = CreateBookSchema.safeParse(data);

        if (!parsed.success) {
            throw parsed.error;
        }

        const { title, author, description, cover_path, pdf_path, user_id } = parsed.data;

        const bookData: Partial<BookType> = {
            title,
            author,
            cover_path,
            pdf_path,
            user_id,
        };

        const book = await model.create(bookData);
        return book;
    }

}

export default BookService;