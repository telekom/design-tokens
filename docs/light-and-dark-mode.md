# Light & dark mode
Dark mode (predominantly dark colors, with light text & accents) and light mode (predominantly light colors with dark text & accents) are directed at different user groups and different usage scenarios.
There is no mode that is *better* for all users, so our recommendation is to allow user to choose which mode they prfer.

It's important to not that this is not just an astethic choice but often one about avoiding eye strain either because of the light in the environment or visual impairments such as cataract.
## Benefits of light modes
For most users with normal vision light mode is the preferred mode has been shown to lead to better task completion or accuracy performance.
This is especially true in a well lit environment like an office during the day.

As this is the majority of our users for most products, we recommend light mode as the standard if there are no specific reasons to prefer dark mode.

## Benefits of dark modes
Dark mode is specifically benefitial for users with some visual impairments. Some users, especially with cloudy vision may prefer dark mode as it makes it easier distinguish elements and texts. 
Some users also benefit from the reduced contrast in dark mode.

For most users, also with normal vision, dark mode is preferable at night and in dimly lit environments. This helps avoid eye strain and tiredness.

# Implementation
It is recommended to allow the user the choice between dark and light mode.

The preferred way if implementing dark and light mode is with a button or similar ui element that toggles between dark and light mode.
If user preferences can be derived from the operating system like via `prefers-color-scheme` on the web, the preferred mode should be selected automatically.

Allow users to set their preferences within your product is not required but a good practise as users may prefer some products to always use one specific mode.

## For Designers
Scale is set up to allow you to start in either light or dark mode. Once your designs are implemented the other mode can be enabled by the development team and should work automatically without additional design.
However if you want to view our designs in the other mode this possible as well.
### Sketch
You need to install scale in both light and dark mode in sketch. You can find the nessesary information in the section: [getting started for desingers](https://www.brand-design.telekom.com/scale/?path=/story/scale-for-designers-getting-started--page&globals=locale:en).

The libraries have the same name but can be differentiated via their icon. If you designed in light mode, you can enable dark mode by following those steps in sketch:
1. Go to Preferences > Libraries
2. Select the unselected of the two libraries (dark mode in our example)
3. When asked, select the "Replace" option
4. Close the preferences window
5. In Sketch click on the notification icon (bell) in the top right corner and select "Component Updates Available"
6. Select "update components"

Now all your desings should be updated the use the other mode.

### Figma (beta)
tbd

## For Developers
Dark mode is included in Scale from version `3.0.0-rc.1`. It leverages CSS variables to allow changing modes.

By default, the mode will be set to match the operating system preferences, via the `prefers-color-scheme` media query.

Alternatively, modes can be set via the `data-mode` attribute. The value must be either `light` or `dark`. It's recommended to do this in the `body`, e.g. `<body data-mode="light">`, though it's possible to also switch only a specific part of the page. 

Setting the `data-mode` attribute will override the system preferences.

### Adding a switch

A switch can be built into the UI with a bit of JavaScript, to set the `data-mode` attribute accordingly. The following snippet should serve as an illustration:

```js
const element = document.querySelector('.mode-switch')

element.addEventListener('click', function switchMode() {
  const isDark = document.body.dataset.mode === 'dark'
  document.body.dataset.mode = isDark ? 'light' : 'dark'
})
```

In JavaScript, you can check and monitor the system preference via the [`window.matchMedia`](https://developer.mozilla.org/en-US/docs/Web/API/Window/matchMedia) method.

```js
const mq = window.matchMedia('(prefers-color-scheme: dark)')
const isDark = mq.matches
```

### Disabling automatic switching

If you want your app to be in either light or dark mode regardless of the user's system preferences, set the `data-mode` attribute to the desired mode:

```html
<body data-mode="light">
```
