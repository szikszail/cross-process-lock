'use strict';

const logger = require('log4js').getLogger(require('../package.json').name);

const {existsSync, unlinkSync} = require('fs-extra');
const {readMetadata} = require('./utils');

const unlock = file => {
    logger.debug('unlock', file);

    if (!existsSync(file)) {
        logger.debug('unlock', 'file does not exist');
        return Promise.resolve();
    }

    const lockFile = `${file}.lock`;
    logger.debug('unlock', lockFile);

    return readMetadata(lockFile).then(metadata => {
        if (!metadata || metadata.pID === process.pid) {
            unlinkSync(lockFile);
        }
    });
};

module.exports = unlock;