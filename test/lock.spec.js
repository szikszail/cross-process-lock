'use strict';

const lock = require('../lib/lock');
const {expect} = require('chai');

const fail = e => expect(e).to.be.undefined;

describe('cross-process-lock - lock', () => {
    it('should throw error if no file found to lock', () => {
        return lock('file/which/does/not/exists.txt').then(fail, e => {
            expect(String(e)).to.contain('does not exist');
        });
    });
})