const values = Object.values
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
 *
 * @return object
 */
function all(targets) {
  const res = {}

  // TODO: Improve function logic
  for (const [name, target] of values(targets)) {
    if (!/.+(Sync|Stream|Promise)$/.test(name)) {
      res[name] = promisify(target)
    }
  }

  return res
}

function some(targets, list = []) {
  if (!isArray(list)) {
    throw new TypeError("The list of target function should be an array")
  }

  return all(values(targets).filter(target => list.includes(target)))
}

function except(targets, list = []) {
  if (!isArray(list)) {
    throw new TypeError("The list of target function should be an array")
  }

  return all(values(targets).filter(target => list.includes(target) === false))
}

module.exports = promisify
exports.default = promisify
exports.all = all
exports.some = some
exports.except = except
