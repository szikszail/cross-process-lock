'use strict';

const logger = require('log4js').getLogger(require('../package.json').name);

const {
    existsSync, ensureFile, 
    readFile, writeFile
} = require('fs-extra');

/**
 * @typedef {Object} lockOptions
 * @property {number} lockTimeout - timeout (ms) when locks automatically released, default: 20 min
 * @property {number} waitTimeout - timeout (ms) until lock waits to lock a file, default: 10 sec
 * @property {boolean} debug - should debug messages be printed out, default: false
 */
const DEFAULT_OPTIONS = {
    lockTimeout: 20 * 60 * 1e3,
    waitTimeout: 10 * 1e3,
    debug: false
};
const INTERVAL = 500;

/**
 * Reads metadata from the given file
 * @param {string} file - path to file to read metadata from
 * @returns {Promise}
 */
const readMetadata = file => new Promise((resolve, reject) => {
    logger.debug('readMetadata', file);
    readFile(file, {encoding: 'utf8'}, (err, data) => {
        logger.debug('readMetadata', err, data);
        if (err) {
            reject(err);
        } else {
            try {
                resolve(JSON.parse(data));
            } catch (e) {
                logger.debug('readMetadata', 'not JSON');
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
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        }
    )
});

/**
 * Locks the given file
 * @param {string} file - path to file to lock
 * @param {lockOptions} options - options to use to lock file, e.g timeouts
 * @returns {Promise}
 */
const lock = (file, options) => {
    options = Object.assign({}, DEFAULT_OPTIONS, options || {});
    if (options.debug) {
        logger.level = 'debug';
    }
    logger.debug('lock', file);
    logger.debug('lock', options);

    if (!existsSync(file)) {
        logger.debug('lock', 'file does not exist');
        return Promise.reject(`The given file to lock ("${file}") does not exist!`);
    }

    const lockTime = new Date().valueOf();
    const lockFile = `${file}.lock`;

    logger.debug('lock', lockTime, lockFile);

    const tryToLock = () => new Promise((resolve, reject) => {
        const now = new Date().valueOf();
        logger.debug('lock', 'now', now);
        if (now - lockTime >= options.waitTimeout) {
            logger.debug('lock', 'too many tries');
            reject(`Couldn't lock file ("${file}") in the given timeout (${options.waitTimeout} ms)`);
        } else {
            const schedule = () => {
                logger.debug('lock', 'schedule');
                setTimeout(() => {
                    logger.debug('lock', 'schedule', 'called');
                    tryToLock().then(resolve, reject);
                }, INTERVAL);
            };

            let def = Promise.resolve(null);
            if (existsSync(lockFile)) {
                logger.debug('lock', 'read metadata');
                def = readMetadata(lockFile);
            }
            def.then(metadata => {
                logger.debug('lock', 'metadata', metadata);
                const actual = new Date().valueOf();
                metadata && logger.debug('lock', 'lock obsolete', actual - metadata.lockTime, actual - metadata.lockTime > options.lockTimeout);
                if (
                    !metadata || 
                    metadata.pID === process.pid ||
                    actual - metadata.lockTime > options.lockTimeout
                ) {
                    logger.debug('lock', 'lock file')
                    saveMetadata(lockFile, lockTime)
                        .then(resolve)
                        .catch(schedule);
                } else {
                    logger.debug('lock', 'next iteration');
                    schedule();
                }
            }).catch(schedule);
        }
    });

    return tryToLock();
};

module.exports = lock;