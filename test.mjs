import test from 'tape'
import prettier from 'babel-plugin-generator-prettier'
import dedent from 'dedent'
import babel from '@babel/core'
import { SourceMapConsumer } from 'source-map'

test('printing', function (t) {
  t.plan(1)
  const result = babel.transformSync(`
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
  const result = babel.transformSync(`
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

test('comments', function (t) {
  t.plan(1)
  const result = babel.transformSync(`
    whatever(
    // test
    'a long string and some arguments', 'that will hopefully cause prettier to wrap this',
    /* har har */ { oh: 'em', gee }
    )
  `, { plugins: [prettier] })
  t.equal(result.code, dedent`
    whatever(
      // test
      "a long string and some arguments",
      "that will hopefully cause prettier to wrap this",
      /* har har */ { oh: "em", gee }
    );
  ` + '\n')
})

test('source maps', function (t) {
  t.plan(4)
  const result = babel.transformSync(dedent`
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

  const map = new SourceMapConsumer(result.map)
  // the `a` in `const a = b`
  const original = map.originalPositionFor({
    line: 4,
    column: 6
  })
  t.equal(original.line, 2)
  t.equal(original.column, 6)
})
