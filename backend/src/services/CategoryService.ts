import Category from "../models/Category";
import { CreateCategorySchema, type CreateCatInput } from "../util/validator/cat.validator";



const model = new Category();

export default class CategoryService {

    static async all() {
        return model.all();
    }

    static async find(id: number) {
        return model.find(id);
    }

    static async create(data: CreateCatInput) {
        const parsed = CreateCategorySchema.safeParse(data);

        if (!parsed.success) {
            throw parsed.error;
        }

        const { name } = parsed.data;

        const cat = model.create({ name });
        return cat;
    }

}