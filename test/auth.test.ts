import * as mongodb from '../src/mongodb';
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
import { SPRING_SCRAPE_UUID, getSpringScrapeUserFromToken, getUserFromToken, login, register } from '../src/auth';

const validExpiredToken: string = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1dWlkIjoiMDdiMmEzMjYtYzA5ZS00MTQxLWIyMTctZjdiYjY0MWY2MmIzIiwiZW1haWwiOiJhYmNAYWJjLnBsIiwiaWF0IjoxNzA2NTI4NzM4LCJleHAiOjE3MDY1MzU5Mzh9.WFun_los8MoWSV8V-GKX286Ozng4tNh2mevjvveJDwE";

const mockPayload: { email: string, uuid: string } = {
    uuid: 'e20c2498-82aa-4f15-ab22-576314f53478',
    email: 'test@test.pl',
}

const springPayload: { email: string, uuid: string } = {
    uuid: SPRING_SCRAPE_UUID,
    email: "spring_scrape",
}

const mockUserPassword: string = 'Pwdpwd123*&';

const getMockUser: () => Promise<mongodb.User> = async () => {
    const hashedPwd = await bcrypt.hash(mockUserPassword, 10);
    return {
        ...mockPayload,
        password: hashedPwd
    };
};

jest.mock('../src/mongodb.ts', () => ({
    findUserByEmail: jest.fn(),
    insertToUsers: jest.fn()
}));

jest.mock('jsonwebtoken', () => ({
    ...jest.requireActual('jsonwebtoken'),
    verify: jest.fn()
}));

describe('getUserFromToken spec', () => {
    afterEach(() => {
        jest.resetAllMocks();
    });

    it('getUserFromToken should return a user if token is valid and user exists', async () => {
        const mockUser = await getMockUser();
        (mongodb.findUserByEmail as jest.Mock).mockImplementation(() => Promise.resolve(mockUser));
        (jwt.verify as jest.Mock).mockReturnValue(mockPayload);
        
        const ret = await getUserFromToken(validExpiredToken);

        expect(ret).toEqual(mockUser);
    });

    it('getUserFromToken should throw error if token is missing', async () => {
        const mockUser = await getMockUser();
        (mongodb.findUserByEmail as jest.Mock).mockImplementation(() => Promise.resolve(mockUser));
        (jwt.verify as jest.Mock).mockReturnValue(mockPayload);
        
        try {
            await getUserFromToken('');

            expect(true).toEqual(false);
        } catch(err) {
            expect(err).toBeInstanceOf(Error);
            expect(err).toHaveProperty('message', 'Not authenticated');

        }
    });

    it('getUserFromToken should throw error if token is invalid', async () => {
        const mockUser = await getMockUser();
        const invalidToken: string = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
        (mongodb.findUserByEmail as jest.Mock).mockImplementation(() => Promise.resolve(mockUser));
        (jwt.verify as jest.Mock).mockReset();
        
        try {
            await getUserFromToken(invalidToken);

            expect(true).toEqual(false);
        } catch(err) {
            expect(err).toBeInstanceOf(Error);
            expect(err).toHaveProperty('message', 'Not authenticated');

        }
    });

    it('getUserFromToken should throw error if user is not found', async () => {
        (mongodb.findUserByEmail as jest.Mock).mockImplementation(() => Promise.resolve(undefined));
        (jwt.verify as jest.Mock).mockReturnValue(mockPayload);
        
        try {
            await getUserFromToken(validExpiredToken);

            expect(true).toEqual(false);
        } catch(err) {
            expect(err).toBeInstanceOf(Error);
            expect(err).toHaveProperty('message', 'Not authenticated');

        }
    });

    it('getUserFromToken should throw error if there is uuid mismatch', async () => {
        const mockUser = await getMockUser();
        (mongodb.findUserByEmail as jest.Mock).mockImplementation(() => Promise.resolve({
            ...mockUser,
            uuid: '123'
        }));
        (jwt.verify as jest.Mock).mockReturnValue(mockPayload);
        
        try {
            await getUserFromToken(validExpiredToken);

            expect(true).toEqual(false);
        } catch(err) {
            expect(err).toBeInstanceOf(Error);
            expect(err).toHaveProperty('message', 'Not authenticated');

        }
    });
});

describe('getSpringScrapeUserFromToken spec', () => {
    afterEach(() => {
        jest.resetAllMocks();
    });

    it('getSpringScrapeUserFromToken should return a valid payload if token is valid and user is Spring server user', async () => {
        (jwt.verify as jest.Mock).mockReturnValue(springPayload);
        
        const ret = await getSpringScrapeUserFromToken(validExpiredToken);

        expect(ret).toEqual(springPayload);
    });

    it('getSpringScrapeUserFromToken should throw error if token is missing', async () => {
        (jwt.verify as jest.Mock).mockReturnValue(springPayload);
        
        try {
            await getSpringScrapeUserFromToken('');

            expect(true).toEqual(false);
        } catch(err) {
            expect(err).toBeInstanceOf(Error);
            expect(err).toHaveProperty('message', 'Not authenticated');

        }
    });

    it('getSpringScrapeUserFromToken should return false if invalid token is provided', async () => {
        (jwt.verify as jest.Mock).mockReturnValue(mockPayload);
        
        const ret = await getSpringScrapeUserFromToken(validExpiredToken);

        expect(ret).toEqual(false);
    });
});

describe('login spec', () => {
    afterEach(() => {
        jest.resetAllMocks();
    });

    it('should return success=true along with user and token if credentials are valid and user exists', async () => {
        const actualJwt = jest.requireActual('jsonwebtoken');
        const mockUser = await getMockUser();
        (mongodb.findUserByEmail as jest.Mock).mockImplementation(() => Promise.resolve(mockUser));

        const ret = await login(mockUser.email, mockUserPassword);
        const tokenPayload = actualJwt.verify(ret.token, 'UYGgyugf896tGhgOGkjh76G');

        expect(ret).toBeDefined();
        expect(ret.success).toBeTruthy();
        expect(ret.user).toEqual(mockUser);
        expect(tokenPayload).toEqual(expect.objectContaining({ uuid: mockUser.uuid, email: mockUser.email }));
    });

    it('valid token\'s expiration date should be 2 hours from now', async () => {
        const actualJwt = jest.requireActual('jsonwebtoken');
        const mockUser = await getMockUser();
        (mongodb.findUserByEmail as jest.Mock).mockImplementation(() => Promise.resolve(mockUser));

        const ret = await login(mockUser.email, mockUserPassword);
        const tokenPayload = actualJwt.verify(ret.token, 'UYGgyugf896tGhgOGkjh76G');

        const expDate = new Date(parseInt(tokenPayload.exp) * 1000);
        const diff = expDate.getTime() - new Date().getTime();
        const hrDiff = diff / 3600 / 1000;
        const expiresInHours = parseFloat((hrDiff).toFixed(2));
        
        expect(expiresInHours).toEqual(2);
    });


    it('should return success=true along with user and token if credentials are valid Spring credentials', async () => {
        const actualJwt = jest.requireActual('jsonwebtoken');
    
        const ret = await login(springPayload.email, 'UYGgyugf896tGhgOGkjh76G');

        expect(ret).toBeDefined();
        expect(ret.success).toBeTruthy();
        expect(ret.user).toEqual({ email: 'spring_scrape' });
        expect(actualJwt.verify(ret.token, 'UYGgyugf896tGhgOGkjh76G')).toEqual(expect.objectContaining({ uuid: SPRING_SCRAPE_UUID, email: 'spring_scrape' }));
    });

    it('should return error message if email not present', async () => {
        const ret = await login('', 'mypassword');

        expect(ret).toBeDefined();
        expect(ret.success).toBeFalsy();
        expect(ret.error).toEqual({ message: 'Both email and password are required.' });
    });

    it('should return error message if password not present', async () => {
        const ret = await login('myemail', '');

        expect(ret).toBeDefined();
        expect(ret.success).toBeFalsy();
        expect(ret.error).toEqual({ message: 'Both email and password are required.' });
    });

    it('should return error message if email is not valid', async () => {
        const ret = await login('myemail', 'Myvalidpwd123*');

        expect(ret).toBeDefined();
        expect(ret.success).toBeFalsy();
        expect(ret.error).toEqual({ message: 'Email does not meet requirements.' });
    });

    it.each([['Pass12*'], ['PASSWD12*'], ['passwd12*'], ['Passwddd*'], ['Passwd123']])
    ('should return error message if password is not valid: %p', async (pwd) => {
        const ret = await login('myemail@something.org', pwd);

        expect(ret).toBeDefined();
        expect(ret.success).toBeFalsy();
        expect(ret.error).toEqual({ message: 'Password does not meet requirements.' });
    });

    it('should return success=false if credentials are invalid', async () => {
        (mongodb.findUserByEmail as jest.Mock).mockImplementation(() => Promise.resolve(undefined));

        const ret = await login('myemail@org.org', 'Mymockpwd123*');

        expect(ret).toBeDefined();
        expect(ret.success).toBeFalsy();
        expect(ret.error).toEqual({ message: 'Invalid credentials.'});
    });
});

describe('register spec', () => {
    afterEach(() => {
        jest.resetAllMocks();
    });

    it('should return success=true along with user and token and insert user to database if credentials are valid', async () => {
        const actualJwt = jest.requireActual('jsonwebtoken');
        const mockUser = await getMockUser();
        (mongodb.insertToUsers as jest.Mock).mockImplementation(() => Promise.resolve(mockUser));

        const ret = await register(mockUser.email, mockUserPassword);
        const tokenPayload = actualJwt.verify(ret.token, 'UYGgyugf896tGhgOGkjh76G');

        expect(ret).toBeDefined();
        expect(ret.success).toBeTruthy();
        expect(ret.user!.email).toEqual(mockUser.email);
        expect(await bcrypt.compare(mockUserPassword, ret.user!.password)).toBeTruthy();
        expect(ret.user!.uuid!.length).toEqual(36);
        expect(ret.user!.uuid!.match(/\w{8}-\w{4}-4\w{3}-\w{4}-\w{12}/)).toBeTruthy();
        expect(tokenPayload).toEqual(expect.objectContaining({ uuid: ret.user!.uuid, email: ret.user!.email }));
    });

    it('valid token\'s expiration date should be 2 hours from now', async () => {
        const actualJwt = jest.requireActual('jsonwebtoken');
        const mockUser = await getMockUser();
        (mongodb.insertToUsers as jest.Mock).mockImplementation(() => Promise.resolve(mockUser));

        const ret = await register(mockUser.email, mockUserPassword);
        const tokenPayload = actualJwt.verify(ret.token, 'UYGgyugf896tGhgOGkjh76G');

        const expDate = new Date(parseInt(tokenPayload.exp) * 1000);
        const diff = expDate.getTime() - new Date().getTime();
        const hrDiff = diff / 3600 / 1000;
        const expiresInHours = parseFloat((hrDiff).toFixed(2));
        
        expect(expiresInHours).toEqual(2);
    });

    it('should return error message if email not present', async () => {
        const ret = await register('', 'mypassword');

        expect(ret).toBeDefined();
        expect(ret.success).toBeFalsy();
        expect(ret.error).toEqual({ message: 'Both email and password are required.' });
    });

    it('should return error message if password not present', async () => {
        const ret = await register('myemail', '');

        expect(ret).toBeDefined();
        expect(ret.success).toBeFalsy();
        expect(ret.error).toEqual({ message: 'Both email and password are required.' });
    });

    it('should return error message if email is not valid', async () => {
        const ret = await register('myemail', 'Myvalidpwd123*');

        expect(ret).toBeDefined();
        expect(ret.success).toBeFalsy();
        expect(ret.error).toEqual({ message: 'Email does not meet requirements.' });
    });

    it.each([['Pass12*'], ['PASSWD12*'], ['passwd12*'], ['Passwddd*'], ['Passwd123']])
    ('should return error message if password is not valid: %p', async (pwd) => {
        const ret = await register('myemail@something.org', pwd);

        expect(ret).toBeDefined();
        expect(ret.success).toBeFalsy();
        expect(ret.error).toEqual({ message: 'Password does not meet requirements.' });
    });
});