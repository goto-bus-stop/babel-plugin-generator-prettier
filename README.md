# babel-plugin-generator-prettier

Babel plugin to use prettier for transformed code output

> Requires Babel 7.

[![npm][npm-image]][npm-url]
[![travis][travis-image]][travis-url]
[![standard][standard-image]][standard-url]

[npm-image]: https://img.shields.io/npm/v/babel-plugin-generator-prettier.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/babel-plugin-generator-prettier
[travis-image]: https://img.shields.io/travis/goto-bus-stop/babel-plugin-generator-prettier.svg?style=flat-square
[travis-url]: https://travis-ci.org/goto-bus-stop/babel-plugin-generator-prettier
[standard-image]: https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square
[standard-url]: http://npm.im/standard

## Install

```
npm install babel-plugin-generator-prettier
```

## Usage

In .babelrc:

```json
{
  "plugins": [
    "generator-prettier"
  ],
  "generatorOpts": {
    "printWidth": 120,
    "semi": false,
    "singleQuote": true
  }
}
```

Options listed in `generatorOpts` are passed to prettier.

## License

[Apache-2.0](LICENSE.md)
