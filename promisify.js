const {isString} = require("util")

const {isObject, isArrayOf, filter} = require("./helper")

const keys = Object.keys
const isArray = Array.isArray

/**
 * Promisify Node.js callback-style function
 *
 * @param function target – a callback-style function
 *
 * @return function - promised function
 *
 * Example
 * ```js
 * import fs from "fs"
 *
 * const readFile = promisify(fs.readFile)
 *
 * const onFulfilled = content => console.log(String(content))
 *
 * const onRejected = err => console.error(err)
 *
 * readFile(__filename).then(onFulfilled, onRejected)
 * ```
 */
const promisify = (target, ctx = null) => function(...args) {
  ctx || (ctx = this)

  return new Promise((resolve, reject) => {
    const fulfill = (err, res) => err ? reject(err) : resolve(res)

    target.call(ctx, ...args, fulfill)
  })
}

/**
 * Promisify all given methods
 *
 * @param object targets - object that contains pairs of name => target
 * @param any ctx
 *
 * @return object
 */
function all(targets, ctx) {
  if (!isObject(targets)) {
    throw new TypeError("Target functions should be passed as an object.")
  }

  const res = {}

  for (const name of keys(targets)) {
    if (!/.+(Sync|Stream|Promise)$/.test(name)) {
      res[name] = promisify(targets[name], ctx)
    }
  }

  return res
}

/**
 * @param object targets
 * @param string[] list
 * @param any ctx
 *
 * @return object
 */
function some(targets, list, ctx) {
  if (!isArray(list)) {
    throw new TypeError("The list of target function should be an array.")
  }

  if (!isArrayOf(list, isString)) {
    throw new TypeError("Each element in the list should be a string.")
  }

  return all(filter(targets, (_, name) => list.includes(name)), ctx)
}

/**
 * @param object targets
 * @param string[] list
 * @param any ctx
 *
 * @return object
 */
function except(targets, list, ctx) {
  if (!isArray(list)) {
    throw new TypeError("The list of target function should be an array.")
  }

  if (!isArrayOf(list, isString)) {
    throw new TypeError("Each element in the list should be a string.")
  }

  return all(filter(targets, (_, name) => !list.includes(name)), ctx)
}

module.exports = promisify
module.exports.default = promisify
module.exports.all = all
module.exports.some = some
module.exports.except = except
