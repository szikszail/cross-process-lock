# cross-process-lock

![Downloads](https://img.shields.io/npm/dw/cross-process-lock?style=flat-square)
![Version@npm](https://img.shields.io/npm/v/cross-process-lock?label=version%40npm&style=flat-square)
![Version@git](https://img.shields.io/github/package-json/v/szikszail/cross-process-lock/master?label=version%40git&style=flat-square)
![CI](https://img.shields.io/github/actions/workflow/status/szikszail/cross-process-lock/ci.yml?branch=master&label=ci&style=flat-square) 
![Docs](https://img.shields.io/github/actions/workflow/status/szikszail/cross-process-lock/docs.yml?branch=master&label=docs&style=flat-square)

Cross-process file locking solution with lock-queue

## Usage

``` javascript
const { lock } = require('cross-process-lock');
const { writeFileSync } = require('fs');
// create a lock for the given file
const unlock = await lock('file.txt')
// do smth with the file here
writeFileSync('file.txt', 'some content', 'utf8');
// unlock file with the received function
return unlock();
```

## API

### Lock

`lock(file[, options])` - creates a lock for the given file for the actual process

**Arguments**:

* `{string} file` - the path of the file needs to be locked
* `{lockOptions} options` - the options to use to lock file, e.g timeouts

**Returns**: `Promise<Function>` - resolved with `unlock` function in case of successful lock; rejected in case of file couldn't be lock in the given timeout

### Unlock

`unlock(file)` - deletes the lock for the given file for the actual process

**Arguments**:

* `{string} file` - the path of the file needs to be unlocked

**Returns**: `Promise` - resolved in case of successful unlock or rejected in case of any error

### WithLock

`withLock(file[, options], callback)` - executes the callback with locking before and unlocking after the execution

**Arguments**:
* `{string} file` - path of the file needs to be locked
* `{lockOptions} options` - the options to use to lock file, e.g timeouts
* `{() => Promise<T>} callback` - the function to be executed

**Returns**: `Promise<T>` - resolved/rejected with the result of the callback

### lockOptions

| Option                 | Description                                    |  Default   |
| :--------------------- | :--------------------------------------------- | :--------: |
| `lockTimeout {number}` | timeout (ms) when locks automatically released | 20 minutes |
| `waitTimeout {number}` | timeout (ms) until lock waits to lock a file   | 10 seconds |

## Debug

The package uses the [debug](https://www.npmjs.com/package/debug) NPM package with `cross-process-lock:PID` name, where `PID` is the process ID of the current process.

To enable debug logging, use for example the `DEBUG=cross-process-lock:*` environment variable, but for more information, check the documentation of the [debug](https://www.npmjs.com/package/debug) package.
