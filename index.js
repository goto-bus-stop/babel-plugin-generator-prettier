var prettier = require('prettier')
var has = require('has')
var SourceMapGenerator = require('source-map').SourceMapGenerator

var optionKeys = [
  'printWidth',
  'tabWidth',
  'useTabs',
  'semi',
  'singleQuote',
  'trailingComma',
  'bracketSpacing',
  'jsxBracketSameLine',
  'arrowParens',
  'requirePragma',
  'insertPragma'
]

function print (parse, ast, opts, input) {
  var formatOpts = {
    // By using a custom parser we can use the already parsed AST.
    // This is better than using __debug.formatAST, because this way prettier still handles comments;
    // comments would be lost when using the formatAST API.
    parser: function () {
      return ast
    }
  }

  var filename = opts.sourceFileName

  for (var i = 0; i < optionKeys.length; i++) {
    if (has(opts, optionKeys[i])) {
      formatOpts[optionKeys[i]] = opts[optionKeys[i]]
    }
  }

  var result = prettier.format(input, formatOpts)
  var map = null

  if (opts.sourceMaps) {
    var parsed = parse(result)
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

  var parseOptions = {}
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
  var generator = new SourceMapGenerator({ file: opts.file })
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
    var cont = visit(left, right)
    if (cont === false) return

    for (var k in left) {
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
    for (var i = 0; i < left.length; i++) {
      if (isNode(left[i]) && isNode(right[i])) walk(left[i], right[i], visit)
    }
  }
}
