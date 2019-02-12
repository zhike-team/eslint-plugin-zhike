# eslint-plugin-zhike
custom eslint rules for apollon-frontend

### Usage
```bash
npm install --save-dev @zhike/eslint-plugin
```

### Configuration
```js
{
  plugins: [
    '@zhike'
  ],
  rules: {
    '@zhike/use-images-by-require': 'error'
  }
}
```

### Rules
 - `use-images-by-require` : 静态图片必须以 `require()` 的方式引入
