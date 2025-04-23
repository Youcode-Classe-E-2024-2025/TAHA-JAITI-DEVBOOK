import type { Request, Response } from "express";
import CategoryService from "../services/CategoryService";



export default class CategoryController {

    static async index(req: Request, res: Response) {
        const cats = await CategoryService.all();

        res.status(200).json({ categories: cats });
    }

    static async show(req: Request, res: Response) {
        const id = req.params.id;


        const cat = await CategoryService.find(Number(id));

        if (!cat) {
            res.status(404).json({ message: "none found" });
        }

        res.status(200).json({ category: cat });
    }

    static async create(req: Request, res: Response) {

        const cat = await CategoryService.create(req.body);

        if (!cat) {
            res.status(404).json({ message: "Failed to create" });
        }

        res.status(200).json({ category: cat });

    }

}