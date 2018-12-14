import {lock} from "../src";

describe("Lock",   () => {
    test("should throw error if no file exists to lock", async (done) => {
        try {
            await lock("there/is/no/file/like/this");
            done.fail();
        } catch(e) {
            expect(String(e)).toContain('does not exist');
            done();
        }
    });
});