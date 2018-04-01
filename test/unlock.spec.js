'use strict';

const unlock = require('../lib/unlock');
const {expect} = require('chai');

const fail = e => expect(e).to.be.undefined;

describe('cross-process-lock - unlock', () => {
    it('should throw error if no file found to unlock', () => {
        return unlock('file/which/does/not/exists.txt').then(fail, e => {
            expect(String(e)).to.contain('does not exist');
        });
    });
})