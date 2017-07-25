const entries = Object.entries

const isObject = obj => (
  Object.prototype.toString.call(obj).slice(8, -1).toLowerCase() === "object"
)

function isArrayOf(arr, predicate, ctx = null) {
  for (const [key, val] of arr.entries()) {
    if (predicate.call(ctx, val, key, arr) === false) {
      return false
    }
  }

  return true
}

function filter(obj, predicate, ctx = null) {
  const res = {}

  for (const [key, val] of entries(obj)) {
    if (predicate.call(ctx, val, key, obj)) {
      res[key] = val
    }
  }

  return res
}

module.exports = {
  isObject,
  isArrayOf,
  filter
}
