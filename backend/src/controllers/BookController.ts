import type { Request, Response } from "express";
import BookService from "../services/BookService";
import Storage from "../util/storage";

class BookController {

    static async index(req: Request, res: Response) {
        const books = await BookService.all();
        res.status(200).json(books);
    }

    static async store(req: Request, res: Response) {
        try {
            const { fields, files } = await Storage.parse(req);

            const bookData = {
                title: fields.title?.[0] ?? '',
                author: fields.auth?.[0] ?? '',
                description: fields.description?.[0] ?? '',
                cover_path: files.cover?.[0]?.filepath ?? '',
                pdf_path: files.pdf?.[0]?.filepath ?? '',
                user_id: req.user?.id!
            };

            const book = await BookService.create(bookData);

            res.status(201).json(book);
        } catch (err: unknown) {
            res.status(400).json({ error: err });
        }

    }
}

export default BookController;