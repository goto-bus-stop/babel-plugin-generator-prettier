var test = require('tape')
var prettier = require('..')
var dedent = require('dedent')
var babel = require('@babel/core')

test('printing', function (t) {
  t.plan(1)
  var result = babel.transformSync(`
    function a() {return test }
    const test=a
    test(  ''
    )
  `, { plugins: [prettier] })
  t.equal(result.code, dedent`
    function a() {
      return test;
    }
    const test = a;
    test("");
  ` + '\n')
})

test('generatorOpts', function (t) {
  t.plan(1)
  var result = babel.transformSync(`
    function a() {return test }
    const test=a
    test(  ''
    )
  `, {
    plugins: [prettier],
    generatorOpts: {
      semi: false,
      singleQuote: true
    }
  })
  t.equal(result.code, dedent`
    function a() {
      return test
    }
    const test = a
    test('')
  ` + '\n')
})

// Currently unsupported
test('source maps', { skip: true }, function (t) {
  t.plan(1)
  var result = babel.transformSync(`
    function a() {return test }
    const test=a
    test(  ''
    )
  `, {
    sourceMaps: true,
    plugins: [
      ['minify-mangle-names', { topLevel: true }],
      prettier
    ]
  })
  t.equal(result.code, dedent`
    function b() {
      return a;
    }
    const a = b;
    a("");
  ` + '\n')
  t.ok(result.map)
})
