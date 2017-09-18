const keys = Object.keys

function isArrayOf(arr, predicate, ctx = null) {
  for (const [key, val] of arr.entries()) {
    if (predicate.call(ctx, val, key, arr) === false) {
      return false
    }
  }

  return true
}

function map(obj, fn) {
  const res = {}

  for (const key of keys(obj)) {
    const val = obj[key]

    res[key] = fn(val, key, obj)
  }

  return res
}

module.exports = {isArrayOf, map}
