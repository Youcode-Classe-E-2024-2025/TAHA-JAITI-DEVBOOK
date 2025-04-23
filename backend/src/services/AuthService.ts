import bcrypt from 'bcrypt'
import User from '../models/User';
import { signToken } from '../util/jwt';

const model = new User();

class AuthService {

    static async register(username: string, email: string, password: string) {
        const hash = await bcrypt.hash(password, 10);
        const res = await model.create({ username, email, password: hash });
        const token = signToken({ id: res.id });

        return token;
    }

    static async login(email: string, password: string) {
        const user = await model.findByMail(email);


        if (!user) {
            return false;
        }

        const check = await bcrypt.compare(password, user.password);

        if (!check) {
            return false;
        }

        const token = signToken({ id: user.id });
        return token;
    }
}


export default AuthService;