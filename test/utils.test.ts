import fs from "fs";
import { 
    generateUUID,
    getPath,
    getWebpageName,
    getDirectories,
    getFilenames,
    removeFile,
    removeDir,
    sameMembers,
    getJobLinkByUuid
} from "../src/utils";
import { Job } from "../src/mongodb";

jest.mock('fs', () => ({
    __esModule: true,
    default: {
        readdirSync: jest.fn(),
        statSync: jest.fn(),
        unlink: jest.fn(),
        rmdir: jest.fn()
    }
}));

const mockJobs: Job[] = [
    {
        uuid: 'mockUuid1',
        host: 'mockHost1',
        path: 'mockPath1',
        link: 'mockLink1',
        userUuid: 'mockUserUuid1'
    },
    {
        uuid: 'mockUuid2',
        host: 'mockHost2',
        path: 'mockPath2',
        link: 'mockLink2',
        userUuid: 'mockUserUuid2'
    }
];

const mockFilenames = ['filename1.json', 'filename2.exe', 'dir1', 'filename3.png', '.dir2'];

describe('utils spec', () => {
    it('generateUUID spec', () => {
        const ret = generateUUID();

        expect(ret.length).toEqual(36);
        expect(ret.match(/\w{8}-\w{4}-4\w{3}-\w{4}-\w{12}/)).toBeTruthy();
    });

    it('getPath spec', () => {
        const ret = getPath('https://mydomain.org/some/path/to/page/{}', 24);

        expect(ret).toEqual('https://mydomain.org/some/path/to/page/24');
    });

    it('getWebpageName spec', () => {
        const ret = getWebpageName('https://bulldogjob.pl/companies/jobs/s/city,Remote,Warszawa/role,fullstack/skills,Java,JavaScript/page.3');

        expect(ret).toEqual('bulldogjob');
    });

    it('getDirectories', () => {
        (fs.readdirSync as jest.Mock).mockImplementation((path) => mockFilenames);
        (fs.statSync as jest.Mock).mockImplementation((path) => ({
            isDirectory: jest.fn().mockImplementation(() => path.includes('dir'))
        }));

        const ret = getDirectories('.');

        expect(ret).toEqual(expect.arrayContaining(['.dir2', 'dir1']));
    });

    it('getFilenames', () => {
        (fs.readdirSync as jest.Mock).mockImplementation((path) => 
            mockFilenames.filter(f => !f.includes('dir')));

        const ret = getFilenames('.');

        expect(ret).toEqual(expect.arrayContaining(['filename1', 'filename2', 'filename3']));
    });

    it('removeFile', () => {
        jest.mocked(fs.unlink).mockImplementationOnce((path, cb) => true);

        const ret1 = removeFile('./file');

        expect(ret1).toBeTruthy();
        
        jest.mocked(fs.unlink).mockImplementationOnce((path, cb) => { cb(new Error())});

        const ret2 = removeFile('./file');

        expect(ret2).toBeFalsy();
    });

    it('removeDir', () => {
        jest.mocked(fs.rmdir).mockImplementationOnce((path, cb) => true);

        const ret1 = removeDir('./dir');

        expect(ret1).toBeTruthy();
        
        jest.mocked(fs.rmdir).mockImplementationOnce((path, cb) => { cb(new Error())});

        const ret2 = removeDir('./dir');

        expect(ret2).toBeFalsy();
    });

    it.each([[['a', 'b'], ['b', 'a'], true], [['a', 'b'], ['b'], false],  [[], [], true], [[null], [null], true], [[undefined], [undefined], true], [[false], [undefined], false]])
    ('sameMembers: %p', (l, r, res) => {
        const ret = sameMembers(l as Object[], r as Object[]);

        expect(ret).toBeDefined();
        expect(ret).toEqual(res);
    });

    it('getJobLinkByUuid', () => {
        const ret1 = getJobLinkByUuid(mockJobs[1].uuid!, mockJobs);

        expect(ret1).toEqual(mockJobs[1].link);

        const ret2 = getJobLinkByUuid('mockUuid3', mockJobs);

        expect(ret2).toEqual(null);
    });
});