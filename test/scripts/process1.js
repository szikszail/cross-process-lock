'use strict';

const {lock} = require('../../index');
const {readFileSync, writeFileSync} = require('fs-extra');

lock('tmp/tmp.txt').then(unlock => {
    setTimeout(() => {
        const content = readFileSync('tmp/tmp.txt', 'utf8');
        writeFileSync('tmp/tmp.txt', content + 'process1.', 'utf8');
        unlock();
    }, 500);
});