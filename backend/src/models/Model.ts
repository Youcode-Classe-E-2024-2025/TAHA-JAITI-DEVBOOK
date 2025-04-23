import type { RowDataPacket } from "mysql2";
import db from "../db";

abstract class Model<T> {

    protected table: string;

    constructor(table: string) {
        this.table = table;
    }

    async all(): Promise<T[]> {
        const [rows] = await db.query(`SELECT * FROM ${this.table}`);
        return rows as T[];
    }

    async find(id: number): Promise<T | null> {
        const [rows] = await db.query<RowDataPacket[]>(`SELECT * FROM ${this.table} WHERE id = ?`, [id]);
        return rows[0] as T || null;
    }

    async delete(id: number): Promise<boolean> {
        const res = await db.query(`DELETE FROM ${this.table} WHERE id = ?`, id);

        return res ? true : false;
    }

    async create(data: Partial<T>): Promise<T> {
        const cols = Object.keys(data).join(', ');
        const vals = Object.values(data);

        const stifham = vals.map(() => '?').join(', ');

        const [result] = await db.query(
            `INSERT INTO ${this.table} (${cols}) VALUES (${stifham})`, vals
        );

        const [rows] = await db.query<RowDataPacket[]>(`SELECT * FROM ${this.table} WHERE id = LAST_INSERT_ID()`);
        return rows[0] as T;
    }

    async update(id: number, data: Partial<T>): Promise<T> {
        const cols = Object.keys(data);
        const vals = Object.values(data);

        const updates = cols.map(key => `${key} = ?`).join(', ');

        const [result] = await db.query(
            `UPDATE ${this.table} SET ${updates} WHERE id = ?`, [...vals, id]
        );

        const [rows] = await db.query<RowDataPacket[]>(`SELECT * FROM ${this.table} WHERE id = ?`, [id]);
        return rows[0] as T;
    }

}

export default Model;