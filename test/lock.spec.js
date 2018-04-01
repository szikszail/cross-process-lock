'use strict';

const {lock, unlock} = require('../index');
const {expect} = require('chai');
const {
    ensureFileSync, ensureDirSync,
    emptyDirSync, existsSync, 
    writeFileSync, readFileSync
} = require('fs-extra');
const {fork} = require('child_process');

const FILE = 'tmp/tmp.txt'

describe('cross-process-lock', () => {
    before(() => ensureDirSync('tmp'));

    beforeEach(() => {
        emptyDirSync('tmp');
        ensureFileSync(FILE);
        writeFileSync(FILE, '', 'utf8');
    });

    it('should work in case of single process', () => {
        return lock(FILE)
            .then(() => expect(existsSync(FILE + '.lock')).to.be.true)
            .then(() => writeFileSync(FILE, 'test-case-1', 'utf8'))
            .then(() => unlock(FILE))
            .then(() => expect(existsSync(FILE + '.lock')).to.be.false)
            .then(() => expect(readFileSync(FILE, 'utf8')).to.equal('test-case-1'));
    });

    it('should work in case of single process with direct unlock', () => {
        return lock(FILE)
            .then(unlock => {
                expect(existsSync(FILE + '.lock')).to.be.true;
                writeFileSync(FILE, 'test-case-1', 'utf8');
                return unlock();
            })
            .then(() => expect(existsSync(FILE + '.lock')).to.be.false)
            .then(() => expect(readFileSync(FILE, 'utf8')).to.equal('test-case-1'));
    });


    it('should work in case of multiple processes', () => {
        const forkProcess = (path, delay = 0) => new Promise(resolve => {
            setTimeout(() => {
                const cp = fork(path, [], {
                    cwd: process.cwd()
                });
                cp.on('close', resolve);
            }, delay);
        });

        return Promise.all([
            forkProcess('test/scripts/process1.js', 100),
            forkProcess('test/scripts/process2.js', 400)
        ]).then(() => {
            expect(existsSync(FILE + '.lock')).to.be.false;
            expect(readFileSync(FILE, 'utf8')).to.equal('process1.process2.');
        });
    })
});