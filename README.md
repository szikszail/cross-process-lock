# cross-process-lock

[![Build Status](https://travis-ci.org/szikszail/cross-process-lock.svg?branch=master)](https://travis-ci.org/szikszail/cross-process-lock) [![dependency Status](https://david-dm.org/szikszail/cross-process-lock.svg)](https://david-dm.org/szikszail/cross-process-lock) [![devDependency Status](https://david-dm.org/szikszail/cross-process-lock/dev-status.svg)](https://david-dm.org/szikszail/cross-process-lock#info=devDependencies) [![Coverage Status](https://coveralls.io/repos/github/szikszail/cross-process-lock/badge.svg?branch=master)](https://coveralls.io/github/szikszail/cross-process-lock?branch=master)

Cross-process file locking solution with lock-queue

## Usage

```javascript
'use strict';

const {lock} = require('cross-process-lock');
const {writeFileSync} = require('fs');
// create a lock for the given file
lock('file.txt').then(unlock => {
    // do smth with the file here
    writeFileSync('file.txt', 'some content', 'utf8');
    // unlock file with the received function
    return unlock();
});
```

## API

### Lock

`lock(file[, options])` - creates a lock for the given file for the actual process

**Arguments**:
* `{string} file` - path of the file needs to be locked
* `{lockOptions} options` - options to use to lock file, e.g timeouts

**Returns**: `Promise<Function>` - resolved with `unlock` function in case of successful lock or rejected in case of file couldn't be lock in the given timeout

### Unlock

`unlock(file)` - deletes the lock for the given file for the actual process

**Arguments**:
* `{string} file` - path of the file needs to be unlocked

**Returns**: `Promise` - resolved in case of successful unlock or rejected in case of any error

### lockOptions

| Option | Description | Default |
|:-------|:------------|:-------:|
| `lockTimeout {number}` | timeout (ms) when locks automatically released | 20 minutes |
| `waitTimeout {number}` | timeout (ms) until lock waits to lock a file | 10 seconds |
| `debug {boolean}` | should debug messages be printed out | `false` |