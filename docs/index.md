# Telekom Design Tokens

### What are design tokens?
Design tokens are a concept to bring consistancy and easy maintainability to product development. By tokenizing design choices like colors, typography, spacing or border radii it gets much easier to assure consistancy between design and implementation. Handing over designs to developers is less error-prone as developers can pick the right token from the predefined package. Lastly tokens can be updated globally and automatically change in all projects, e.g. when a color needs to be adjusted to improve accessibility.

If you want to learn more about design tokens you can read this article [Design tokens — What are they & how will they help you?](https://lukasoppermann.medium.com/design-tokens-what-are-they-how-will-they-help-you-b73f80f602ab).

### How are design tokens implemented in practise at deutsche telekom?
The source of truth are our [design token on github](https://github.com/telekom/design-tokens). These tokens are created in a JSON format and converted into formats that can be used in sketch, figma, css or javascript by a program called [style dictionary](https://github.com/amzn/style-dictionary).

The Sketch & Figma library are created by using the respective outputs from style dictionary. As a developer you can pull the design tokens directly from github into you project. This assures that everybody at deutsche telekom works with the same design primatives and we create a consistant, high quality experience for our customers.

The [Scale design system](https://github.com/telekom/scale) uses the design token package as well, so all components are using the same primatives you use.

You can find more about implementing design tokens into your product workflow in the article [Building better products with a design token pipeline](https://uxdesign.cc/building-better-products-with-the-design-token-pipeline-faa86aa068e8).

### Who uses design tokens?
**Designers** use tokens in their design tools in the form of styles. We convert the design tokens into color, text and shadow styles for sketch and figma. As a desinger you can work like you always did, using styles for your designs. However when there is an update to the tokens you just have to pull in the changes an everything will be updated automatically.

Through tokes you can also easily preview your designs in light and dark mode to make sure it works well in both.

Lastly, by using semantic token names like `Text & Icon / Standard` or `Text & Icon / Link / Hovered`, you will have an easier time understanding and remembering what to use specific styles for.

**Developers** use tokens when building layouts and components. Our tokens are transformed to multiple formats like css variables or javascript objects. Tokens makes it easy match the styles you receive from the designers. You also get darkmode for free, by using the correct tokens. No extra implementation needed.

Whenever a token needs to be updated all you have to do is pull in the latest changes from github or npm and your code will be updated automatically.
### Why should you use design tokens?
For both designers and developers there are three important benefits of using out design tokens.

1. Your designs and components will be accessible and you will have an easier time getting approval.
2. Your product will be brand conform and stay within the telekom brand guidelines automatically.
3. You can allow your users to choose between dark & light mode without additional work on your side.

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
