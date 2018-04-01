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

const forkProcess = (args, delay = 0) => new Promise(resolve => {
    setTimeout(() => {
        const cp = fork('test/scripts/process.js', args, {
            cwd: process.cwd(),
            stdio: 'inherit'
        });
        cp.on('close', resolve);
    }, delay);
});

describe('cross-process-lock - integration', () => {
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
        return Promise.all([
            forkProcess([
                '--append=process1.',
                '--writeDelay=1950',
                '--unlockDelay=2000'
            ], 100),
            forkProcess([
                '--append=process2.',
                '--writeDelay=0',
                '--unlockDelay=2000'
            ], 400)
        ]).then(codes => {
            expect(codes).to.eql([0, 0]);
            expect(existsSync(FILE + '.lock')).to.be.false;
            expect(readFileSync(FILE, 'utf8')).to.equal('process1.process2.');
        });
    });

    it('should work in case of multiple processes with lock timeout', () => {
        return Promise.all([
            forkProcess([
                '--append=process1.',
                '--writeDelay=0',
                '--unlockDelay=2000'
            ], 100),
            forkProcess([
                '--append=process2.',
                '--writeDelay=0',
                '--unlockDelay=2000',
                '--lock=1000'
            ], 400)
        ]).then(codes => {
            expect(codes).to.eql([0, 0]);
            expect(existsSync(FILE + '.lock')).to.be.false;
            expect(readFileSync(FILE, 'utf8')).to.equal('process1.process2.');
        });
    });
});