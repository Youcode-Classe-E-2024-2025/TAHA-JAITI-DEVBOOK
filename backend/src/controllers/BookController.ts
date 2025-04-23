import type { Request, Response } from "express";
import BookService from "../services/BookService";


class BookController {

    static async index(req: Request, res: Response){
        const books = await BookService.all();
        res.status(200).json(books);
    }

}

export default BookController;