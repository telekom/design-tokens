# Mobile and Fluid Typography

Apart from the standard one, there's a typography scale optimised for mobile. There is also a fluid scale —currently only supported in CSS via the `clamp` function—, that uses values from both of them.

## Mobile

This scale includes not only changes in size but also in line spacing via text style tokens.

The source files for the scale can be found in:
- `src/semantic/typography-mobile.tokens.json5`
- `src/semantic/text-style-mobile.tokens.json5`

It's available in all currently supported outputs.

### CSS

The CSS variable names include `mobile` after the `font-size` category:

```css
:root {
  /* standard-scale token */
  --telekom-typography-font-size-body: 1rem;

  /* mobile-scale token */
  --telekom-typography-font-size-mobile-body: 1rem;
}
```

It's also possible to switch an entire page to the mobile-optimised scale, without having to change all individual tokens.

This is achieved via the `data-type-scale="mobile"` attribute, which is normally set in the `<body>` tag.

### Figma

In Tokens Studio the mobile tokens can be found in a subfolder called `Mobile`, for both Typography (size) and Text Styles.

## Fluid

There's an experimental fluid scale available only for CSS. Based on the fluid techniques leveraged by [the utopia.fyi project](https://utopia.fyi/blog/designing-with-fluid-type-scales).

Font sizes are mobile-optimised in the smallest viewport (`320px`) and will grow progressively until reaching the standard sizes at the "large" breakpoint (`1040px`).

### CSS

The CSS variable names include `fluid` after the `font-size` category:

```css
:root {
  /* standard-scale token */
  --telekom-typography-font-size-headline-3: 1.5rem;

  /* mobile-scale token */
  --telekom-typography-font-size-fluid-headline-3: clamp(1.375rem, calc(1.319rem + 0.3vw), 1.500rem);
}
```

It's also possible to switch an entire page to the fluid scale, without having to change all individual tokens.

This is achieved via the `data-type-scale="fluid"` attribute, which is normally set in the `<body>` tag.
