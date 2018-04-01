'use strict';

const {lock} = require('../../index');
const {readFileSync, writeFileSync} = require('fs-extra');
const args = require('yargs')
    .options({
        lock: {
            type: 'number',
            default: 20*60*1e3
        },
        wait: {
            type: 'number',
            default: 1e4
        },
        debug: {
            type: 'boolean',
            default: false
        },
        file: {
            type: 'string',
            default: 'tmp/tmp.txt'
        },
        append: {
            type: 'string'
        },
        writeDelay: {
            type: 'number',
            default: 0
        },
        unlockDelay: {
            type: 'number',
            default: 500
        }
    })
    .argv;

lock(args.file, {
    lockTimeout: args.lock,
    waitTimeout: args.wait,
    debug: args.debug
}).then(unlock => {
    setTimeout(() => {
        const content = readFileSync(args.file, 'utf8');
        writeFileSync(args.file, content + args.append, 'utf8');
    }, args.writeDelay);
    setTimeout(unlock, Math.max(args.writeDelay, args.unlockDelay));
});