import Book from "../models/Book";

const model = new Book();

class BookService {

    static async all(){
        return await model.all();
    }

}

export default BookService;