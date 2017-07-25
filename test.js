const {isFunction} = require("util")

const test = require("ava")
const {spy} = require("sinon")

const pfy = require("./promisify")
const {isArrayOf, isObject} = require("./helper")

test.beforeEach(t => {
  const noop = reject => function noop(val, cb) {
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
      return "foo"
    }
  }

  t.context = {
    getLastElement,
    functions,
    noop
  }
})

test("Should be a function", t => {
  t.plan(1)

  t.true(isFunction(pfy))
})

test("Should return a promisify function", t => {
  t.plan(2)

  const noop = pfy(t.context.noop())

  t.true(isFunction(noop))
  t.true(noop() instanceof Promise)
})

test("Should pass a \"fulfill\" function as last parameter", async t => {
  t.plan(3)

  const getLastElement = t.context.getLastElement
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
  t.plan(1)

  const functions = t.context.functions

  const keys = Object
    .keys(functions)
    .filter(name => !/.+(Sync|Stream|Promise)$/.test(name))

  const actual = Object.keys(pfy.all(functions))

  t.deepEqual(keys, actual)
})

test("Should wrap some functions, that were specified in a list", t => {
  t.plan(1)

  const functions = t.context.functions

  const list = ["foo"]

  const keys = Object
    .keys(functions)
    .filter(name => list.includes(name))
    .filter(name => !/.+(Sync|Stream|Promise)$/.test(name))

  const actual = Object.keys(pfy.some(functions, list))

  t.deepEqual(keys, actual)
})

test(
  "Should wrap all functions, EXCEPT the ones that were specified in a list",
  t => {
    t.plan(1)

    const functions = t.context.functions

    const list = ["foo"]

    const keys = Object
      .keys(functions)
      .filter(name => !list.includes(name))
      .filter(name => !/.+(Sync|Stream|Promise)$/.test(name))

    const actual = Object.keys(pfy.except(functions, list))

    t.deepEqual(keys, actual)
  }
)

test("Should thow an error when \"reject\" argument is truthy.", async t => {
  t.plan(1)

  const noop = pfy(t.context.noop(true))

  await t.throws(noop(),
    "This function has been rejected cuz \"reject\" parameter is truthy."
  )
})

test(
  "Should throw an error when promisify.all takes non-object value " +
  "first argument",
  t => {
    t.plan(3)

    const trap = () => pfy.all("oops, seems like this is not an object!")

    const err = t.throws(trap)

    t.true(err instanceof TypeError)
    t.is(err.message, "Target functions should be passed as an object.")
  }
)

// Tests for helpers
test("isObject: Should return true when passed plain object", t => {
  t.plan(1)

  t.true(isObject({}))
})

test("isObject: Should return flase when passed non-object value", t => {
  t.plan(1)

  t.false(isObject(3310))
})

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
