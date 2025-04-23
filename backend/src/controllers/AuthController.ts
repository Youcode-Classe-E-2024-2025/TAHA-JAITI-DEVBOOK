import type { Request, Response } from "express";
import AuthService from "../services/AuthService";



class AuthController {

    static async register(req: Request, res: Response) {
        const { username, email, password } = req.body;
        const token = await AuthService.register(username, email, password);
        res.status(201).json({ token });
    }

    static async login(req: Request, res: Response) {
        const { email, password } = req.body;

        const token = await AuthService.login(email, password);

        if (token) {
            res.status(201).json({ token });
        }

        res.status(401).json({ message: 'Invalid email or password' });
    }

    static async me(req: Request, res: Response){
        res.json(req.user);
    }

}

export default AuthController;