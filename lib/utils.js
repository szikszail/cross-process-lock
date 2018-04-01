'use strict';

const logger = require('log4js').getLogger(
    `${require('../package.json').name}#${process.pid}`
);

const {readFile, writeFile} = require('fs-extra');


/**
 * Reads metadata from the given file
 * @param {string} file - path to file to read metadata from
 * @returns {Promise}
 */
const readMetadata = file => new Promise((resolve, reject) => {
    logger.debug('readMetadata', file);
    readFile(file, {encoding: 'utf8'}, (err, data) => {
        logger.debug('readMetadata', err, data);
        /* istanbul ignore if */
        if (err) {
            reject(err);
        } else {
            try {
                resolve(JSON.parse(data));
            } catch (e) {
                /* istanbul ignore next */
                logger.debug('readMetadata', 'not JSON');
                /* istanbul ignore next */
                resolve(null);
            }
        }
    });
});

/**
 * Saves metadata to the given file
 * @param {string} file - path to file to write metadata to
 * @param {number} lockTime - timestamp when lock should be registered
 * @returns {Promise}
 */
const saveMetadata = (file, lockTime) => new Promise((resolve, reject) => {
    logger.debug('saveMetadata', file, lockTime);
    const metadata = {
        pID: process.pid,
        lockTime
    };
    logger.debug('saveMetadata', metadata);
    writeFile(
        file,
        JSON.stringify(metadata),
        { encoding: 'utf8'},
        err => {
            logger.debug('saveMetadata', 'done', err);
            /* istanbul ignore if */
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        }
    )
});

module.exports.readMetadata = readMetadata;
module.exports.saveMetadata = saveMetadata;