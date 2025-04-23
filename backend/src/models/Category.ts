import Model from "./Model";

export interface CategoryType {
    id: number;
    name: string;
    created_at: string;
    updated_at: string;
}


export default class Category extends Model<CategoryType> {

    constructor() {
        super('categories');
    }

}