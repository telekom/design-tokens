# Telekom Design Tokens

## Introduction

### What are design tokens?


### Who uses design tokens?
**Designers** use tokens in their design tools in the form of styles. We convert the design tokens into color, text and shadow styles for sketch and figma. As a desinger you can work like you always did, using styles for your designs. However when there is an update to the tokens you just have to pull in the changes an everything will be updated automatically.

Through tokes you can also easily preview your designs in light and dark mode to make sure it works well in both.

Lastly, by using semantic token names like `Text & Icon / Standard` or `Text & Icon / Link / Hovered`, you will have an easier time understanding and remembering what to use specific styles for.

**Developers** use tokens when building layouts and components. Our tokens are transformed to multiple formats like css variables or javascript objects. Tokens makes it easy match the styles you receive from the designers. You also get darkmode for free, by using the correct tokens. No extra implementation needed.

Whenever a token needs to be updated all you have to do is pull in the latest changes from github or npm and your code will be updated automatically.
### Why should you use design tokens?

### How are design tokens related to Scale, the telekom design system?
Scale uses design tokens as a base to style all components. 

This allows us to centrally define colors, text styles, shadows and other visual aspects.
It also makes it possible to define combinations of background and foreground colors that have great contrast to fulfill wacg guidelines and be accessible.

With the tightly integrated token system we devloped switchen between light and dark mode is possible without changing any componente code. With minimal effort code, sketch or figma components can be change from light mode to dark mode and back.

Lastly design tokens enable much more customization so that scale will be able to grow with the needs of your projects. May that be custom styling for individual components or complelty changing the style e.g. when using scale for a different brand or sub-brand.

## Light and dark mode
Design tokens are the base for an intuitive light and dark mode.
You can read more about why you should implement it and how to do so in this section:

- [Light and dark mode](./light-and-dark-mode.md)

## Working with telekom design tokens
The `@telekom/design-tokens` repo contains the `core` tokens and the `semantics` tokens. You can find them within the `src` folder.
As a user of [Scale](https://github.com/telekom/scale) or the the design tokens repo you only need to care about the `semantic` tokens.


- [Color tokens](./color.md)
- [Shadows](./shadows.md)
