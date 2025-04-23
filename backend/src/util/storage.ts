import type { Request } from 'express';
import formidable, { type Fields, type Files } from 'formidable';
import path from 'path';

export default class Storage {
    static uploadDir = path.join(import.meta.dir, '../../uploads');

    static form = formidable({
        uploadDir: Storage.uploadDir,
        keepExtensions: true,
        maxFileSize: 20 * 1024 * 1024,
        multiples: false,
        filter: ({ name }) => {
            return name === 'cover' || name === 'pdf';
        },
    });

    static parse(req: Request): Promise<{ fields: Fields; files: Files }> {
        return new Promise((resolve, reject) => {
            Storage.form.parse(req, (err, fields, files) => {
                if (err) return reject(err);
                resolve({ fields, files });
            });
        });
    }
}
