export interface Borrowing {
    id?: number;
    user_id: number;
    book_id: number;
    borrow_date: Date;
    due_date: Date;
    return_date?: Date;
}