const prettier = require('prettier')
const has = require('has')
const SourceMapGenerator = require('source-map').SourceMapGenerator

const optionKeys = [
  'printWidth',
  'tabWidth',
  'useTabs',
  'semi',
  'singleQuote',
  'quoteProps',
  'jsxSingleQuote',
  'trailingComma',
  'bracketSpacing',
  'jsxBracketSameLine',
  'arrowParens',
  'requirePragma',
  'insertPragma',
  'endOfLine'
]

function print (parse, ast, opts, input) {
  const formatOpts = {
    // By using a custom parser we can use the already parsed AST.
    // This is better than using __debug.formatAST, because this way prettier still handles comments;
    // comments would be lost when using the formatAST API.
    parser: function () {
      return ast
    }
  }

  const filename = opts.sourceFileName

  for (let i = 0; i < optionKeys.length; i++) {
    if (has(opts, optionKeys[i])) {
      formatOpts[optionKeys[i]] = opts[optionKeys[i]]
    }
  }

  const result = prettier.format(input, formatOpts)
  let map = null

  if (opts.sourceMaps) {
    const parsed = parse(result)
    map = generateSourceMap(ast, parsed, {
      file: filename,
      source: input
    })
  }

  return {
    code: result,
    map: map
  }
}

module.exports = function generatorPrettier (api) {
  api.assertVersion(7)

  let parseOptions = {}
  function parse (code) {
    return api.parseSync(code, parseOptions.parserOpts)
  }

  return {
    manipulateOptions: function (opts) {
      parseOptions = opts
    },
    generatorOverride: print.bind(null, parse)
  }
}

function isNode (node) {
  return typeof node === 'object' && node && typeof node.type === 'string'
}

function generateSourceMap (left, right, opts) {
  const generator = new SourceMapGenerator({ file: opts.file })
  generator.setSourceContent(opts.file, opts.input)

  walk(left, right, function (sourceNode, formattedNode) {
    generator.addMapping({
      source: opts.file,
      original: sourceNode.loc.start,
      generated: formattedNode.loc.start
    })
    generator.addMapping({
      source: opts.file,
      original: sourceNode.loc.end,
      generated: formattedNode.loc.end
    })
  })

  return generator.toJSON()

  function walk (left, right, visit) {
    const cont = visit(left, right)
    if (cont === false) return

    for (const k in left) {
      if (has(left, k)) {
        if (isNode(left[k]) && isNode(right[k])) {
          walk(left[k], right[k], visit)
        } else if (Array.isArray(left[k]) && Array.isArray(right[k])) {
          walkArray(left[k], right[k], visit)
        }
      }
    }
  }

  function walkArray (left, right, visit) {
    for (let i = 0; i < left.length; i++) {
      if (isNode(left[i]) && isNode(right[i])) walk(left[i], right[i], visit)
    }
  }
}
