import bcrypt from 'bcrypt'
import User from '../models/User';
import { signToken } from '../util/jwt';
import { LoginSchema, RegisterSchema, type LoginInput, type RegisterInput } from '../util/validator/auth.validator';

const model = new User();

class AuthService {

    static async register(data: RegisterInput) {
        const parsed = RegisterSchema.safeParse(data);

        if (!parsed.success) {
            throw parsed.error;
        }

        const { username, email, password } = parsed.data;

        const hash = await bcrypt.hash(password, 10);
        const res = await model.create({ username, email, password: hash });
        const token = signToken({ id: res.id });

        return token;
    }

    static async login(data: LoginInput) {
        const parsed = LoginSchema.safeParse(data);

        if (!parsed.success) {
            throw parsed.error;
        }

        const { email, password } = parsed.data;

        const user = await model.findByMail(email);
        if (!user) {
            throw new Error("Invalid credentials");
        }

        const check = await bcrypt.compare(password, user.password);
        if (!check) {
            throw new Error("Invalid credentials");
        }

        const token = signToken({ id: user.id });
        return token;
    }
}


export default AuthService;