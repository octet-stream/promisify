function isArrayOf(arr, predicate, ctx) {
  for (const [key, val] of arr.entries()) {
    if (predicate.call(ctx, val, key, arr) === false) {
      return false
    }
  }

  return true
}

module.exports = isArrayOf
