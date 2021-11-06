const {isFunction} = require("util")

const test = require("ava")
const {spy} = require("sinon")

const pfy = require("./promisify")

const {isArrayOf, isPlainObject} = require("./util")

test.beforeEach(t => {
  const noop = reject => (val, cb) => {
    isFunction(val) && ([cb, val] = [val, null])

    if (reject) {
      return cb(new Error(
        "This function has been rejected cuz \"reject\" parameter is truthy."
      ))
    }

    return cb(null, val)
  }

  const getLastElement = arr => [...arr].pop()

  const functions = {
    foo(cb) {
      cb(null, "foo")
    },

    bar(cb) {
      cb(null, "bar")
    },

    boo(cb) {
      cb(null, "boo")
    },

    fooSync() {
      return "sync method"
    }
  }

  t.context = {
    getLastElement,
    functions,
    noop
  }
})

test("Should return a promisify function", t => {
  t.plan(2)

  const noop = pfy(t.context.noop())

  t.true(isFunction(noop))
  t.true(noop() instanceof Promise)
})

test("Should pass a \"fulfill\" function as last parameter", async t => {
  t.plan(3)

  const {getLastElement} = t.context

  const noop = spy(t.context.noop())
  const callee = pfy(noop)

  await callee("I beat Twilight Sparkle and all I got was this lousy t-shirt.")

  const arg = getLastElement(noop.args[0])

  t.true(isFunction(arg), "Argument \"fulfill\" should be a function.")
  t.truthy(arg.name, "Argument \"fulfill\" can't be anonymous.")
  t.is(arg.name, "fulfill", "Argument \"fulfill\" should have a valid name.")
})

test("Should resolve given value from a function", async t => {
  t.plan(1)

  const val = "It was a dark and stormy night"

  const noop = pfy(t.context.noop())

  const res = await noop(val)

  t.is(res, val)
})

test("Should invoke function with a given context", async t => {
  t.plan(1)

  class NoopClass {
    noopMethod(cb) {
      cb(null, this)
    }
  }

  const noop = new NoopClass()

  const target = pfy(noop.noopMethod, noop)

  const res = await target()

  t.true(res instanceof NoopClass)
})

test("Should wrap all function from given object", t => {
  t.plan(5)

  const {functions} = t.context

  const actual = pfy.all(functions)

  t.true(actual.foo() instanceof Promise)
  t.true(actual.bar() instanceof Promise)
  t.true(actual.boo() instanceof Promise)

  t.false(actual.fooSync() instanceof Promise)

  t.is(actual.fooSync(), "sync method")
})

test("Should wrap some functions that were specified in a list", t => {
  t.plan(5)

  const {functions} = t.context

  const list = ["bar"]

  const actual = pfy.some(functions, list)

  t.true(actual.bar() instanceof Promise)

  t.false(actual.foo(() => {}) instanceof Promise)
  t.false(actual.boo(() => {}) instanceof Promise)
  t.false(actual.fooSync() instanceof Promise)

  t.is(actual.fooSync(), "sync method")
})

test(
  "Should wrap all functions, EXCEPT the ones that were specified in a list",
  t => {
    t.plan(5)

    const {functions} = t.context

    const list = ["foo"]

    const actual = pfy.except(functions, list)

    t.true(actual.bar() instanceof Promise)
    t.true(actual.boo() instanceof Promise)

    t.false(actual.foo(() => {}) instanceof Promise)
    t.false(actual.fooSync() instanceof Promise)

    t.is(actual.fooSync(), "sync method")
  }
)

test("Should throw TypeError when given target is not a function", t => {
  t.plan(3)

  const trap = () => pfy("Oops! That's totally not a function")

  const err = t.throws(trap)

  t.true(err instanceof TypeError)
  t.is(err.message, "Expected target function. Received string")
})

test("Should thow an error when \"reject\" argument is truthy", async t => {
  t.plan(1)

  const noop = pfy(t.context.noop(true))

  await t.throwsAsync(noop())
})

test(
  "Should throw an error when promisify.all takes non-object value "
    + "first argument",

  t => {
    t.plan(3)

    const trap = () => pfy.all("oops, seems like this is not an object!")

    const err = t.throws(trap)

    t.true(err instanceof TypeError)
    t.is(err.message, "Expected a plain object as targets. Received string")
  }
)

test(
  "Should throw a TypeError when promisify.some takes \"targets\" "
    + "as non-object value",

  t => {
    const trap = () => pfy.some("oops, seems like this is not an object!")

    const err = t.throws(trap)

    t.true(err instanceof TypeError)
    t.is(err.message, "Expected a plain object as targets. Received string")
  }
)

test(
  "Should throw a TypeError when promisify.some takes \"list\" "
    + "as non-array value",

  t => {
    const trap = () => pfy.some(t.context.functions)

    const err = t.throws(trap)

    t.true(err instanceof TypeError)
    t.is(err.message, "Expected list as an array. Received undefined")
  }
)

test(
  "Should throw a TypeError when promisify.some takes \"list\" "
    + "as non-string array value",

  t => {
    const trap = () => pfy.some(t.context.functions, [
      "foo", null, 1337
    ])

    const err = t.throws(trap)

    t.true(err instanceof TypeError)
    t.is(err.message, "Each element in the list should be a string.")
  }
)

test(
  "Should throw a TypeError when promisify.except takes \"targets\" "
    + "as non-object value",

  t => {
    const trap = () => pfy.except("oops, seems like this is not an object!")

    const err = t.throws(trap)

    t.true(err instanceof TypeError)
    t.is(err.message, "Expected a plain object as targets. Received string")
  }
)

test(
  "Should throw a TypeError when promisify.except takes \"list\" "
    + "as non-array value",

  t => {
    const trap = () => pfy.except(t.context.functions)

    const err = t.throws(trap)

    t.true(err instanceof TypeError)
    t.is(err.message, "Expected list as an array. Received undefined")
  }
)

test(
  "Should throw a TypeError when promisify.except takes \"list\" "
    + "as non-string array value",

  t => {
    const trap = () => pfy.except(t.context.functions, [
      "foo", null, 1337
    ])

    const err = t.throws(trap)

    t.true(err instanceof TypeError)
    t.is(err.message, "Each element in the list should be a string.")
  }
)

// Tests for helpers
test(
  "isArrayOf: Should return true when types of each elements are correct",

  t => {
    t.plan(1)

    const elements = ["earth pony", "unicorn", "pegasus", "alicorn"]

    const predicate = val => typeof val === "string"

    t.true(isArrayOf(elements, predicate))
  }
)

test(
  "isArrayOf: Should return false when one of elements have an incorrect type",
  t => {
    t.plan(1)

    const elements = ["one", 2, "three"]

    const predicate = val => typeof val === "string"

    t.false(isArrayOf(elements, predicate))
  }
)

test("Should return a boolean value", t => {
  t.plan(3)

  t.is(typeof isPlainObject(), "boolean")

  t.true(isPlainObject({}))
  t.false(isPlainObject("I am waiting for you last summer"))
})

test(
  "Should return false when passed non-object value, "
    + "like some primitives of their constructors",

  t => {
    t.plan(8)

    t.false(isPlainObject(null))
    t.false(isPlainObject(undefined))
    t.false(isPlainObject(void 0))

    t.false(isPlainObject(0))
    t.false(isPlainObject(42))
    t.false(isPlainObject(new Number(2319))) // eslint-disable-line

    t.false(isPlainObject("Some whatever string"))
    // eslint-disable-next-line
    t.false(isPlainObject(new String("Some whatever string")))
  }
)

test("Should return false when passed Array or RegExp", t => {
  t.plan(4)

  t.false(isPlainObject([]))
  t.false(isPlainObject(new Array())) // eslint-disable-line

  t.false(isPlainObject(/.*/))
  t.false(isPlainObject(new RegExp("/.*/")))
})

test(
  "Should return true when passed an object literal or Object.create(null)",
  t => {
    t.plan(3)

    t.true(isPlainObject({}))
    t.true(isPlainObject(Object.create(null)))
    t.true(isPlainObject(new Object({key: "value"}))) // eslint-disable-line
  }
)
