# cross-process-lock

Cross-process file locking solution with lock-queue

## Usage

``` javascript
const {
    lock
} = require('cross-process-lock');
const {
    writeFileSync
} = require('fs');
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

**Returns**: `Promise<Function>` - resolved with `unlock` function in case of successful lock; rejected in case of file couldn't be lock in the given timeout

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
