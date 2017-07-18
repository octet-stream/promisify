# @octetstream/promisify

Tiny, dependency free promisify library.

## API

### promisify(target[, ctx]) -> function

Promisify Node.js callback-style function with native Promise

  * function **target** - function, that will be wrap with a Promise
  * any **ctx** - "this" context for a target function

### promisify.all(targets[, ctx]) -> object

Promisify all functions from given object

  * object **targets** – object of target functinos
  * any **ctx** - "this" context for all wrapped functions

### promisify.some(targets, list[, ctx]) -> object

Promisify some functions from given object, that was specified in list

  * object **targets** – object of target functinos
  * string[] **list** – an array of target functions names
  * any **ctx** - "this" context for all wrapped functions

### promisify.except(targets, list[, ctx]) -> object

Promisify all functions from given object, except the ones from list

  * object **targets** – object of target functinos
  * string[] **list** – an array of target functions names
  * any **ctx** - "this" context for all wrapped functions
