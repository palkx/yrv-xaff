module.exports = {
  'root': true,
  'parserOptions': {
    parser: 'babel-eslint'
  },
  'env': {
    browser: true,
    node: true
  },
  'globals': {
    "expect": true
  },
  'extends': [
    'alpha/src/vue'
  ],
  'rules': {
    'generator-star-spacing': 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off'
  }
}
