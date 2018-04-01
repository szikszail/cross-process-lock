'use strict';

const {lock} = require('../../index');
const {readFileSync, writeFileSync} = require('fs-extra');

lock('tmp/tmp.txt').then(unlock => {
    const content = readFileSync('tmp/tmp.txt', 'utf8');
    writeFileSync('tmp/tmp.txt', content + 'process2.', 'utf8');
    setTimeout(unlock, 500);
});