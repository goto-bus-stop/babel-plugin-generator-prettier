var prettier = require('prettier')
var has = require('has')

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

function print (ast, opts, input) {
  var formatOpts = { originalText: input }

  for (var i = 0; i < optionKeys.length; i++) {
    if (has(opts, optionKeys[i])) {
      formatOpts[optionKeys[i]] = opts[optionKeys[i]]
    }
  }

  var result = prettier.__debug.formatAST(ast.program, formatOpts)

  return {
    code: result.formatted
  }
}

module.exports = function generatorPrettier (api) {
  api.assertVersion(7)

  return {
    generatorOverride: print
  }
}
