import {findUserByEmail, insertToUsers, User} from "./mongodb";
import {generateUUID} from "./utils";

const JWT_SECRET = 'UYGgyugf896tGhgOGkjh76G';
const SPRING_SCRAPE_EMAIL = "spring_scrape";
export const SPRING_SCRAPE_UUID = "606597f4-8e3d-4d42-9d3e-241feee6b9ec";

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

export const register: (email: string, password: string) => Promise<AuthResponse> = async (email: string, password: string) => {
    try {
        if (!email || !password) return { success: false, error: { message: 'Both email and password are required.' } };
        else if (!isValidEmail(email)) return { success: false, error: { message: 'Email does not meet requirements.' } };
        else if (!isValidPwd(password)) return { success: false, error: { message: 'Password does not meet requirements.' } };
        else if (await findUserByEmail(email)) return { success: false, error: { message: 'User with such email already exists.' } };

        const uuid = generateUUID();
        const hashedPwd = await bcrypt.hash(password, 10);
        const token = jwt.sign({ uuid, email }, JWT_SECRET, { expiresIn: '2h' });
        const user: User = { uuid, email, password: hashedPwd };

        await insertToUsers(user);

        return { success: true, token, user };
    } catch (error) {
        throw error;
    }
};

export const login: (email: string, password: string) => Promise<AuthResponse> = async (email: string, password: string) => {
    if (email === SPRING_SCRAPE_EMAIL && password === JWT_SECRET) {
        const token = jwt.sign({ uuid: SPRING_SCRAPE_UUID, email }, JWT_SECRET, { expiresIn: '2h' });
        return { success: true, token, user: { email: SPRING_SCRAPE_EMAIL } };
    }

    if (!email || !password) return { success: false, error: { message: 'Both email and password are required.' } };
    else if (!isValidEmail(email)) return { success: false, error: { message: 'Email does not meet requirements.' } };
    else if (!isValidPwd(password)) return { success: false, error: { message: 'Password does not meet requirements.' } };

    const user = await findUserByEmail(email);
    if (user && await bcrypt.compare(password, user.password)) {
        const token = jwt.sign({ uuid: user.uuid, email }, JWT_SECRET, { expiresIn: '2h' });
        return { success: true, token, user };
    }

    return { success: false, error: { message: 'Invalid credentials.' } };
};

const isValidPwd = (password: string) =>
    password.length >= 8 && password.match(/[a-z]+/) && password.match(/[A-Z]+/) && password.match(/[0-9]+/) && password.match(/[!@#$%^&*()_+~`\-=\[\]{};':",.\/<>?]+/);

const isValidEmail = (email: string) => email.includes('@');

interface AuthResponse {
    success: boolean;
    error?: { message: string };
    token?: string;
    user?: User;
}

const getTokenPayload = (token: string) => {
    return jwt.verify(token, JWT_SECRET);
}

export const getUserFromToken = async (token: string) => {
    if (token) {
        const payload = getTokenPayload(token);
        const uuid = payload?.uuid || null;
        const email = payload?.email || null;
        const user = await findUserByEmail(email);
        if (user?.uuid !== uuid) throw new Error('Not authenticated');
        return user;
    }

    throw new Error('Not authenticated');
}

export const getSpringScrapeUserFromToken = (token: string) => {
    if (token) {
        const { uuid, email } = getTokenPayload(token);
        return email === SPRING_SCRAPE_EMAIL && uuid === SPRING_SCRAPE_UUID && { email: SPRING_SCRAPE_EMAIL, uuid: SPRING_SCRAPE_UUID };
    }

    throw new Error('Not authenticated');
}