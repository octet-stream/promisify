const {isString, isObject} = require("util")

const {isArrayOf, map} = require("./helper")

const isArray = Array.isArray

const filter = name => /.+(Sync|Stream|Promise)$/.test(name) === false

/**
 * Promisify Node.js callback-style function
 *
 * @param {function} target – a callback-style function
 *
 * @return {function} - promised function
 *
 * @example
 *
 * import fs from "fs"
 *
 * const readFile = promisify(fs.readFile)
 *
 * const onFulfilled = content => console.log(String(content))
 *
 * const onRejected = err => console.error(err)
 *
 * readFile(__filename).then(onFulfilled, onRejected)
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

  return map(targets, (fn, name) => filter(name) ? promisify(fn, ctx) : fn)
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

  return map(
    targets, (fn, name) => (
      filter(name) && list.includes(name) ? promisify(fn, ctx) : fn
    )
  )
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

  return map(
    targets, (fn, name) => (
      filter(name) && list.includes(name) === false ? promisify(fn, ctx) : fn
    )
  )
}

module.exports = promisify
module.exports.default = promisify
module.exports.all = all
module.exports.some = some
module.exports.except = except
