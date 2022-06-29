# How to use the Tailwind CSS preset

Setup with NPM as [described in the README](https://github.com/telekom/design-tokens#setup-with-npm): `npm i -D @telekom/design-tokens`

Configure `tailwindcss.config.js` with the appropriate preset depending on whether you want to use the Open source or the Telekom version:

```js
module.exports = {
  presets: [
    // Open source version
    require('@telekom/design-tokens/dist/tailwindcss-preset/design-tokens.config.js'),
    // Telekom version
    require('@telekom/design-tokens/dist/telekom/tailwindcss-preset/telekom-design-tokens.config.js'),
  ],
  // ...
};
```

More info: https://tailwindcss.com/docs/presets