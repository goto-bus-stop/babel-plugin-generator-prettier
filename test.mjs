import { test } from 'uvu'
import { strict as assert } from 'assert'
import prettier from 'babel-plugin-generator-prettier'
import dedent from 'dedent'
import babel from '@babel/core'
import { SourceMapConsumer } from 'source-map'

test('printing', async function () {
  const result = await babel.transformAsync(`
    function a() {return test }
    const test=a
    test(  ''
    )
  `, { plugins: [prettier] })
  assert.equal(result.code, dedent`
    function a() {
      return test;
    }
    const test = a;
    test("");
  ` + '\n')
})

test('generatorOpts', async function () {
  const result = await babel.transformAsync(`
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
  assert.equal(result.code, dedent`
    function a() {
      return test
    }
    const test = a
    test('')
  ` + '\n')
})

test('comments', async function () {
  const result = await babel.transformAsync(`
    whatever(
    // test
    'a long string and some arguments', 'that will hopefully cause prettier to wrap this',
    /* har har */ { oh: 'em', gee }
    )
  `, { plugins: [prettier] })
  assert.equal(result.code, dedent`
    whatever(
      // test
      "a long string and some arguments",
      "that will hopefully cause prettier to wrap this",
      /* har har */ { oh: "em", gee }
    );
  ` + '\n')
})

test('source maps', async function () {
  const result = await babel.transformAsync(dedent`
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

  assert.equal(result.code, dedent`
    function b() {
      return a;
    }
    const a = b;
    a("");
  ` + '\n')
  assert.ok(result.map)

  const map = new SourceMapConsumer(result.map)
  // the `a` in `const a = b`
  const original = map.originalPositionFor({
    line: 4,
    column: 6
  })
  assert.equal(original.line, 2)
  assert.equal(original.column, 6)
})

test.run()
