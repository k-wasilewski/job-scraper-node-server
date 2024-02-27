import { generateUUID, getPath, getWebpageName  } from "../src/utils";

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

    /*it('getDirectories', () => {
        const ret = getDirectories('.');

        // todo: mock 'fs' here

        console.log(ret)
    });*/
});