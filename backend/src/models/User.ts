import type { RowDataPacket } from "mysql2";
import db from "../db";
import Model from "./Model";

interface UserType {
    id?: number;
    username: string;
    email: string;
    password: string;
    created_at?: string;
    updated_at?: string;

}


class User extends Model<UserType> {

    constructor() {
        super('users');
    }

    async findByMail(email: string): Promise<UserType | null> {
        const [rows] = await db.query<RowDataPacket[]>(`SELECT * FROM users WHERE email = ?`, email);
        return rows[0] as UserType || null;
    }

}

export default User;