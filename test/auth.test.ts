import * as mongodb from '../src/mongodb';
const jwt = require('jsonwebtoken');
import { getUserFromToken } from '../src/auth';

const validExpiredToken: string = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1dWlkIjoiMDdiMmEzMjYtYzA5ZS00MTQxLWIyMTctZjdiYjY0MWY2MmIzIiwiZW1haWwiOiJhYmNAYWJjLnBsIiwiaWF0IjoxNzA2NTI4NzM4LCJleHAiOjE3MDY1MzU5Mzh9.WFun_los8MoWSV8V-GKX286Ozng4tNh2mevjvveJDwE";

const mockPayload: { email: string, uuid: string } = {
    uuid: 'e20c2498-82aa-4f15-ab22-576314f53478',
    email: 'test@test.pl',
}

const mockUser: mongodb.User = {
    ...mockPayload,
    password: 'pwd'
};

jest.mock('../src/mongodb.ts', () => ({
    findUserByEmail: jest.fn()
}));

jest.mock('jsonwebtoken', () => ({
    verify: jest.fn()
}));

describe('getUserFromToken spec', () => {
    it('getUserFromToken should return a user if token is valid and user exists', async () => {
        (mongodb.findUserByEmail as jest.Mock).mockImplementation(() => Promise.resolve(mockUser));
        (jwt.verify as jest.Mock).mockReturnValue(mockPayload);
        
        const ret = await getUserFromToken(validExpiredToken);

        expect(ret).toEqual(mockUser);
    });

    it('getUserFromToken should throw error if token is missing', async () => {
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