/**
 * Do not edit directly
 * Generated on Thu, 03 Aug 2023 11:19:41 GMT
 *
 * You can find info about usage here:
 *   - https://github.com/telekom/design-tokens#how-to-use-the-tailwindcss-preset
 *   - https://tailwindcss.com/docs/presets
 */

const plugin = require('tailwindcss/plugin');

/**
 * Flatten shadow keys similarly to
 * `flattenColorPalette` utility function used by core color plugins
 */
const flattenShadows = (shadows) =>
  Object.assign(
    {},
    ...Object.entries(shadows ?? {}).flatMap(([shadow, values]) =>
      typeof values == 'object'
        ? Object.entries(flattenShadows(values)).map(([name, value]) => ({
            [shadow + (name === 'DEFAULT' ? '' : '-' + name)]: value,
          }))
        : [{ [shadow]: values }]
    )
  );

module.exports = {
  theme: {
    colors: {
      'text-&-icon': {
        DEFAULT: 'var(--telekom-color-text-and-icon-standard)',
        additional: 'var(--telekom-color-text-and-icon-additional)',
        disabled: 'var(--telekom-color-text-and-icon-disabled)',
        link: {
          DEFAULT: 'var(--telekom-color-text-and-icon-link-standard)',
          hovered: 'var(--telekom-color-text-and-icon-link-hovered)',
          visited: 'var(--telekom-color-text-and-icon-link-visited)',
          active: 'var(--telekom-color-text-and-icon-link-active)',
        },
        primary: {
          DEFAULT: 'var(--telekom-color-text-and-icon-primary-standard)',
          hovered: 'var(--telekom-color-text-and-icon-primary-hovered)',
          pressed: 'var(--telekom-color-text-and-icon-primary-pressed)',
        },
        inverted: {
          DEFAULT: 'var(--telekom-color-text-and-icon-inverted-standard)',
          additional: 'var(--telekom-color-text-and-icon-inverted-additional)',
        },
        white: {
          DEFAULT: 'var(--telekom-color-text-and-icon-white-standard)',
          additional: 'var(--telekom-color-text-and-icon-white-additional)',
        },
        black: {
          DEFAULT: 'var(--telekom-color-text-and-icon-black-standard)',
          additional: 'var(--telekom-color-text-and-icon-black-additional)',
        },
        functional: {
          informational:
            'var(--telekom-color-text-and-icon-functional-informational)',
          success: 'var(--telekom-color-text-and-icon-functional-success)',
          danger: 'var(--telekom-color-text-and-icon-functional-danger)',
          warning: 'var(--telekom-color-text-and-icon-functional-warning)',
        },
        'on-subtle': {
          informational:
            'var(--telekom-color-text-and-icon-on-subtle-informational)',
          success: 'var(--telekom-color-text-and-icon-on-subtle-success)',
          danger: 'var(--telekom-color-text-and-icon-on-subtle-danger)',
          warning: 'var(--telekom-color-text-and-icon-on-subtle-warning)',
          violet: 'var(--telekom-color-text-and-icon-on-subtle-violet)',
          blue: 'var(--telekom-color-text-and-icon-on-subtle-blue)',
          cyan: 'var(--telekom-color-text-and-icon-on-subtle-cyan)',
          teal: 'var(--telekom-color-text-and-icon-on-subtle-teal)',
          green: 'var(--telekom-color-text-and-icon-on-subtle-green)',
          olive: 'var(--telekom-color-text-and-icon-on-subtle-olive)',
          brown: 'var(--telekom-color-text-and-icon-on-subtle-brown)',
          yellow: 'var(--telekom-color-text-and-icon-on-subtle-yellow)',
          orange: 'var(--telekom-color-text-and-icon-on-subtle-orange)',
          red: 'var(--telekom-color-text-and-icon-on-subtle-red)',
        },
      },
      background: {
        canvas: 'var(--telekom-color-background-canvas)',
        'canvas-subtle': 'var(--telekom-color-background-canvas-subtle)',
        backdrop: 'var(--telekom-color-background-backdrop)',
        surface: 'var(--telekom-color-background-surface)',
        'surface-subtle': 'var(--telekom-color-background-surface-subtle)',
        'surface-highlight':
          'var(--telekom-color-background-surface-highlight)',
      },
      primary: {
        DEFAULT: 'var(--telekom-color-primary-standard)',
        hovered: 'var(--telekom-color-primary-hovered)',
        pressed: 'var(--telekom-color-primary-pressed)',
      },
      ui: {
        base: 'var(--telekom-color-ui-base)',
        subtle: 'var(--telekom-color-ui-subtle)',
        faint: 'var(--telekom-color-ui-faint)',
        regular: 'var(--telekom-color-ui-regular)',
        strong: 'var(--telekom-color-ui-strong)',
        'extra-strong': 'var(--telekom-color-ui-extra-strong)',
        white: 'var(--telekom-color-ui-white)',
        black: 'var(--telekom-color-ui-black)',
        disabled: 'var(--telekom-color-ui-disabled)',
        border: {
          DEFAULT: 'var(--telekom-color-ui-border-standard)',
          hovered: 'var(--telekom-color-ui-border-hovered)',
          pressed: 'var(--telekom-color-ui-border-pressed)',
          disabled: 'var(--telekom-color-ui-border-disabled)',
        },
        'state-fill': {
          DEFAULT: 'var(--telekom-color-ui-state-fill-standard)',
          hovered: 'var(--telekom-color-ui-state-fill-hovered)',
          pressed: 'var(--telekom-color-ui-state-fill-pressed)',
          'hovered-inverted':
            'var(--telekom-color-ui-state-fill-hovered-inverted)',
          'pressed-inverted':
            'var(--telekom-color-ui-state-fill-pressed-inverted)',
        },
      },
      functional: {
        focus: {
          DEFAULT: 'var(--telekom-color-functional-focus-standard)',
          inverted: 'var(--telekom-color-functional-focus-inverted)',
          'on-dark-background':
            'var(--telekom-color-functional-focus-on-dark-background)',
          'on-light-background':
            'var(--telekom-color-functional-focus-on-light-background)',
        },
        informational: {
          DEFAULT: 'var(--telekom-color-functional-informational-standard)',
          hovered: 'var(--telekom-color-functional-informational-hovered)',
          pressed: 'var(--telekom-color-functional-informational-pressed)',
          subtle: 'var(--telekom-color-functional-informational-subtle)',
        },
        success: {
          DEFAULT: 'var(--telekom-color-functional-success-standard)',
          hovered: 'var(--telekom-color-functional-success-hovered)',
          pressed: 'var(--telekom-color-functional-success-pressed)',
          subtle: 'var(--telekom-color-functional-success-subtle)',
        },
        danger: {
          DEFAULT: 'var(--telekom-color-functional-danger-standard)',
          hovered: 'var(--telekom-color-functional-danger-hovered)',
          pressed: 'var(--telekom-color-functional-danger-pressed)',
          subtle: 'var(--telekom-color-functional-danger-subtle)',
        },
        warning: {
          DEFAULT: 'var(--telekom-color-functional-warning-standard)',
          hovered: 'var(--telekom-color-functional-warning-hovered)',
          pressed: 'var(--telekom-color-functional-warning-pressed)',
          subtle: 'var(--telekom-color-functional-warning-subtle)',
        },
      },
      additional: {
        violet: {
          0: 'var(--telekom-color-additional-violet-0)',
          100: 'var(--telekom-color-additional-violet-100)',
          200: 'var(--telekom-color-additional-violet-200)',
          300: 'var(--telekom-color-additional-violet-300)',
          400: 'var(--telekom-color-additional-violet-400)',
          500: 'var(--telekom-color-additional-violet-500)',
          600: 'var(--telekom-color-additional-violet-600)',
          700: 'var(--telekom-color-additional-violet-700)',
          800: 'var(--telekom-color-additional-violet-800)',
          900: 'var(--telekom-color-additional-violet-900)',
          subtle: 'var(--telekom-color-additional-violet-subtle)',
        },
        blue: {
          0: 'var(--telekom-color-additional-blue-0)',
          100: 'var(--telekom-color-additional-blue-100)',
          200: 'var(--telekom-color-additional-blue-200)',
          300: 'var(--telekom-color-additional-blue-300)',
          400: 'var(--telekom-color-additional-blue-400)',
          500: 'var(--telekom-color-additional-blue-500)',
          600: 'var(--telekom-color-additional-blue-600)',
          700: 'var(--telekom-color-additional-blue-700)',
          800: 'var(--telekom-color-additional-blue-800)',
          900: 'var(--telekom-color-additional-blue-900)',
          subtle: 'var(--telekom-color-additional-blue-subtle)',
        },
        cyan: {
          0: 'var(--telekom-color-additional-cyan-0)',
          100: 'var(--telekom-color-additional-cyan-100)',
          200: 'var(--telekom-color-additional-cyan-200)',
          300: 'var(--telekom-color-additional-cyan-300)',
          400: 'var(--telekom-color-additional-cyan-400)',
          500: 'var(--telekom-color-additional-cyan-500)',
          600: 'var(--telekom-color-additional-cyan-600)',
          700: 'var(--telekom-color-additional-cyan-700)',
          800: 'var(--telekom-color-additional-cyan-800)',
          900: 'var(--telekom-color-additional-cyan-900)',
          subtle: 'var(--telekom-color-additional-cyan-subtle)',
        },
        teal: {
          0: 'var(--telekom-color-additional-teal-0)',
          100: 'var(--telekom-color-additional-teal-100)',
          200: 'var(--telekom-color-additional-teal-200)',
          300: 'var(--telekom-color-additional-teal-300)',
          400: 'var(--telekom-color-additional-teal-400)',
          500: 'var(--telekom-color-additional-teal-500)',
          600: 'var(--telekom-color-additional-teal-600)',
          700: 'var(--telekom-color-additional-teal-700)',
          800: 'var(--telekom-color-additional-teal-800)',
          900: 'var(--telekom-color-additional-teal-900)',
          subtle: 'var(--telekom-color-additional-teal-subtle)',
        },
        green: {
          0: 'var(--telekom-color-additional-green-0)',
          100: 'var(--telekom-color-additional-green-100)',
          200: 'var(--telekom-color-additional-green-200)',
          300: 'var(--telekom-color-additional-green-300)',
          400: 'var(--telekom-color-additional-green-400)',
          500: 'var(--telekom-color-additional-green-500)',
          600: 'var(--telekom-color-additional-green-600)',
          700: 'var(--telekom-color-additional-green-700)',
          800: 'var(--telekom-color-additional-green-800)',
          900: 'var(--telekom-color-additional-green-900)',
          subtle: 'var(--telekom-color-additional-green-subtle)',
        },
        olive: {
          0: 'var(--telekom-color-additional-olive-0)',
          100: 'var(--telekom-color-additional-olive-100)',
          200: 'var(--telekom-color-additional-olive-200)',
          300: 'var(--telekom-color-additional-olive-300)',
          400: 'var(--telekom-color-additional-olive-400)',
          500: 'var(--telekom-color-additional-olive-500)',
          600: 'var(--telekom-color-additional-olive-600)',
          700: 'var(--telekom-color-additional-olive-700)',
          800: 'var(--telekom-color-additional-olive-800)',
          900: 'var(--telekom-color-additional-olive-900)',
          subtle: 'var(--telekom-color-additional-olive-subtle)',
        },
        brown: {
          0: 'var(--telekom-color-additional-brown-0)',
          100: 'var(--telekom-color-additional-brown-100)',
          200: 'var(--telekom-color-additional-brown-200)',
          300: 'var(--telekom-color-additional-brown-300)',
          400: 'var(--telekom-color-additional-brown-400)',
          500: 'var(--telekom-color-additional-brown-500)',
          600: 'var(--telekom-color-additional-brown-600)',
          700: 'var(--telekom-color-additional-brown-700)',
          800: 'var(--telekom-color-additional-brown-800)',
          900: 'var(--telekom-color-additional-brown-900)',
          subtle: 'var(--telekom-color-additional-brown-subtle)',
        },
        yellow: {
          0: 'var(--telekom-color-additional-yellow-0)',
          100: 'var(--telekom-color-additional-yellow-100)',
          200: 'var(--telekom-color-additional-yellow-200)',
          300: 'var(--telekom-color-additional-yellow-300)',
          400: 'var(--telekom-color-additional-yellow-400)',
          500: 'var(--telekom-color-additional-yellow-500)',
          600: 'var(--telekom-color-additional-yellow-600)',
          700: 'var(--telekom-color-additional-yellow-700)',
          800: 'var(--telekom-color-additional-yellow-800)',
          900: 'var(--telekom-color-additional-yellow-900)',
          subtle: 'var(--telekom-color-additional-yellow-subtle)',
        },
        orange: {
          0: 'var(--telekom-color-additional-orange-0)',
          100: 'var(--telekom-color-additional-orange-100)',
          200: 'var(--telekom-color-additional-orange-200)',
          300: 'var(--telekom-color-additional-orange-300)',
          400: 'var(--telekom-color-additional-orange-400)',
          500: 'var(--telekom-color-additional-orange-500)',
          600: 'var(--telekom-color-additional-orange-600)',
          700: 'var(--telekom-color-additional-orange-700)',
          800: 'var(--telekom-color-additional-orange-800)',
          900: 'var(--telekom-color-additional-orange-900)',
          subtle: 'var(--telekom-color-additional-orange-subtle)',
        },
        red: {
          0: 'var(--telekom-color-additional-red-0)',
          100: 'var(--telekom-color-additional-red-100)',
          200: 'var(--telekom-color-additional-red-200)',
          300: 'var(--telekom-color-additional-red-300)',
          400: 'var(--telekom-color-additional-red-400)',
          500: 'var(--telekom-color-additional-red-500)',
          600: 'var(--telekom-color-additional-red-600)',
          700: 'var(--telekom-color-additional-red-700)',
          800: 'var(--telekom-color-additional-red-800)',
          900: 'var(--telekom-color-additional-red-900)',
          subtle: 'var(--telekom-color-additional-red-subtle)',
        },
      },
    },
    borderRadius: {
      none: 'var(--telekom-radius-none)',
      'extra-small': 'var(--telekom-radius-extra-small)',
      small: 'var(--telekom-radius-small)',
      'medium-small': 'var(--telekom-radius-medium-small)',
      DEFAULT: 'var(--telekom-radius-standard)',
      large: 'var(--telekom-radius-large)',
      pill: 'var(--telekom-radius-pill)',
      circle: 'var(--telekom-radius-circle)',
    },
    spacing: {
      0: 'var(--telekom-spacing-composition-space-00)',
      1: 'var(--telekom-spacing-composition-space-01)',
      2: 'var(--telekom-spacing-composition-space-02)',
      3: 'var(--telekom-spacing-composition-space-03)',
      4: 'var(--telekom-spacing-composition-space-04)',
      5: 'var(--telekom-spacing-composition-space-05)',
      6: 'var(--telekom-spacing-composition-space-06)',
      7: 'var(--telekom-spacing-composition-space-07)',
      8: 'var(--telekom-spacing-composition-space-08)',
      9: 'var(--telekom-spacing-composition-space-09)',
      10: 'var(--telekom-spacing-composition-space-10)',
      11: 'var(--telekom-spacing-composition-space-11)',
      12: 'var(--telekom-spacing-composition-space-12)',
      13: 'var(--telekom-spacing-composition-space-13)',
      14: 'var(--telekom-spacing-composition-space-14)',
      15: 'var(--telekom-spacing-composition-space-15)',
      16: 'var(--telekom-spacing-composition-space-16)',
      17: 'var(--telekom-spacing-composition-space-17)',
      18: 'var(--telekom-spacing-composition-space-18)',
      19: 'var(--telekom-spacing-composition-space-19)',
      20: 'var(--telekom-spacing-composition-space-20)',
      21: 'var(--telekom-spacing-composition-space-21)',
      'icon-extra-small': 'var(--telekom-size-icon-extra-small)',
      'icon-small': 'var(--telekom-size-icon-small)',
      'icon-medium': 'var(--telekom-size-icon-medium)',
      'icon-large': 'var(--telekom-size-icon-large)',
      'icon-extra-large': 'var(--telekom-size-icon-extra-large)',
      'form-element-height-small':
        'var(--telekom-size-form-element-height-small)',
      'form-element-height-standard':
        'var(--telekom-size-form-element-height-standard)',
      'generic-size-01': 'var(--telekom-size-generic-size-01)',
      'generic-size-02': 'var(--telekom-size-generic-size-02)',
      'generic-size-03': 'var(--telekom-size-generic-size-03)',
      'generic-size-04': 'var(--telekom-size-generic-size-04)',
      'generic-size-05': 'var(--telekom-size-generic-size-05)',
      'generic-size-06': 'var(--telekom-size-generic-size-06)',
      'generic-size-07': 'var(--telekom-size-generic-size-07)',
      'generic-size-08': 'var(--telekom-size-generic-size-08)',
      'generic-size-09': 'var(--telekom-size-generic-size-09)',
      'generic-size-10': 'var(--telekom-size-generic-size-10)',
      'generic-size-11': 'var(--telekom-size-generic-size-11)',
      'generic-size-12': 'var(--telekom-size-generic-size-12)',
      'generic-size-13': 'var(--telekom-size-generic-size-13)',
      'generic-size-14': 'var(--telekom-size-generic-size-14)',
      'generic-size-15': 'var(--telekom-size-generic-size-15)',
      'generic-size-16': 'var(--telekom-size-generic-size-16)',
      'generic-size-17': 'var(--telekom-size-generic-size-17)',
      'generic-size-18': 'var(--telekom-size-generic-size-18)',
      'generic-size-19': 'var(--telekom-size-generic-size-19)',
      'generic-size-20': 'var(--telekom-size-generic-size-20)',
      'generic-size-21': 'var(--telekom-size-generic-size-21)',
      'generic-size-22': 'var(--telekom-size-generic-size-22)',
      'generic-size-23': 'var(--telekom-size-generic-size-23)',
      'generic-size-24': 'var(--telekom-size-generic-size-24)',
      'generic-size-25': 'var(--telekom-size-generic-size-25)',
      'baseline-space-00': 'var(--telekom-spacing-baseline-space-00)',
      'baseline-space-01': 'var(--telekom-spacing-baseline-space-01)',
      'baseline-space-02': 'var(--telekom-spacing-baseline-space-02)',
      'baseline-space-03': 'var(--telekom-spacing-baseline-space-03)',
      'baseline-space-04': 'var(--telekom-spacing-baseline-space-04)',
      'baseline-space-05': 'var(--telekom-spacing-baseline-space-05)',
      'baseline-space-06': 'var(--telekom-spacing-baseline-space-06)',
      'baseline-space-07': 'var(--telekom-spacing-baseline-space-07)',
      'baseline-space-08': 'var(--telekom-spacing-baseline-space-08)',
      'baseline-space-09': 'var(--telekom-spacing-baseline-space-09)',
      'baseline-space-10': 'var(--telekom-spacing-baseline-space-10)',
      'baseline-space-11': 'var(--telekom-spacing-baseline-space-11)',
      'baseline-space-12': 'var(--telekom-spacing-baseline-space-12)',
      'baseline-space-13': 'var(--telekom-spacing-baseline-space-13)',
      'baseline-space-14': 'var(--telekom-spacing-baseline-space-14)',
      'baseline-space-15': 'var(--telekom-spacing-baseline-space-15)',
    },
    borderWidth: {
      DEFAULT: 'var(--telekom-line-weight-standard)',
      highlight: 'var(--telekom-line-weight-highlight)',
      bold: 'var(--telekom-line-weight-bold)',
    },
    transitionDuration: {
      instant: 'var(--telekom-motion-duration-instant)',
      immediate: 'var(--telekom-motion-duration-immediate)',
      transition: 'var(--telekom-motion-duration-transition)',
      animation: 'var(--telekom-motion-duration-animation)',
      'animation-deliberate':
        'var(--telekom-motion-duration-animation-deliberate)',
    },
    transitionTimingFunction: {
      DEFAULT: 'var(--telekom-motion-easing-standard)',
      enter: 'var(--telekom-motion-easing-enter)',
      leave: 'var(--telekom-motion-easing-leave)',
    },
    opacity: {
      invisible: 'var(--telekom-opacity-invisible)',
      transparent: 'var(--telekom-opacity-transparent)',
      'semi-transparent': 'var(--telekom-opacity-semi-transparent)',
      translucent: 'var(--telekom-opacity-translucent)',
      'semi-translucent': 'var(--telekom-opacity-semi-translucent)',
      solid: 'var(--telekom-opacity-solid)',
    },
    shadow: {
      raised: {
        DEFAULT: 'var(--telekom-shadow-raised-standard)',
        hover: 'var(--telekom-shadow-raised-hover)',
        pressed: 'var(--telekom-shadow-raised-pressed)',
      },
      floating: {
        DEFAULT: 'var(--telekom-shadow-floating-standard)',
        hover: 'var(--telekom-shadow-floating-hover)',
        pressed: 'var(--telekom-shadow-floating-pressed)',
      },
      top: 'var(--telekom-shadow-top)',
      overlay: 'var(--telekom-shadow-overlay)',
      intense: 'var(--telekom-shadow-intense)',
      'app-bar': {
        top: {
          raised: 'var(--telekom-shadow-app-bar-top-raised)',
          flat: 'var(--telekom-shadow-app-bar-top-flat)',
        },
        bottom: {
          raised: 'var(--telekom-shadow-app-bar-bottom-raised)',
          flat: 'var(--telekom-shadow-app-bar-bottom-flat)',
        },
      },
    },
    textStyle: {
      badge: 'var(--telekom-text-style-badge)',
      small: 'var(--telekom-text-style-small)',
      'small-bold': 'var(--telekom-text-style-small-bold)',
      caption: 'var(--telekom-text-style-caption)',
      'caption-bold': 'var(--telekom-text-style-caption-bold)',
      body: 'var(--telekom-text-style-body)',
      'body-bold': 'var(--telekom-text-style-body-bold)',
      ui: 'var(--telekom-text-style-ui)',
      'ui-bold': 'var(--telekom-text-style-ui-bold)',
      'lead-text': 'var(--telekom-text-style-lead-text)',
      'heading-6': 'var(--telekom-text-style-heading-6)',
      'heading-5': 'var(--telekom-text-style-heading-5)',
      'heading-4': 'var(--telekom-text-style-heading-4)',
      'heading-3': 'var(--telekom-text-style-heading-3)',
      'heading-2': 'var(--telekom-text-style-heading-2)',
      'heading-1': 'var(--telekom-text-style-heading-1)',
      'title-2': 'var(--telekom-text-style-title-2)',
      'title-1': 'var(--telekom-text-style-title-1)',
    },
    fontSize: {
      badge: 'var(--telekom-typography-font-size-badge)',
      small: 'var(--telekom-typography-font-size-small)',
      caption: 'var(--telekom-typography-font-size-caption)',
      body: 'var(--telekom-typography-font-size-body)',
      callout: 'var(--telekom-typography-font-size-callout)',
      'headline-3': 'var(--telekom-typography-font-size-headline-3)',
      'headline-2': 'var(--telekom-typography-font-size-headline-2)',
      'headline-1': 'var(--telekom-typography-font-size-headline-1)',
      'title-3': 'var(--telekom-typography-font-size-title-3)',
      'title-2': 'var(--telekom-typography-font-size-title-2)',
      'title-1': 'var(--telekom-typography-font-size-title-1)',
    },
    fontFamily: {
      sans: 'var(--telekom-typography-font-family-sans)',
      mono: 'var(--telekom-typography-font-family-mono)',
    },
    fontWeight: {
      thin: 'var(--telekom-typography-font-weight-thin)',
      regular: 'var(--telekom-typography-font-weight-regular)',
      medium: 'var(--telekom-typography-font-weight-medium)',
      bold: 'var(--telekom-typography-font-weight-bold)',
      'extra-bold': 'var(--telekom-typography-font-weight-extra-bold)',
      ultra: 'var(--telekom-typography-font-weight-ultra)',
    },
    lineHeight: {
      none: 'var(--telekom-typography-line-spacing-none)',
      'extra-tight': 'var(--telekom-typography-line-spacing-extra-tight)',
      tight: 'var(--telekom-typography-line-spacing-tight)',
      moderate: 'var(--telekom-typography-line-spacing-moderate)',
      DEFAULT: 'var(--telekom-typography-line-spacing-standard)',
      loose: 'var(--telekom-typography-line-spacing-loose)',
    },
    letterSpacing: {
      DEFAULT: 'var(--telekom-typography-letter-spacing-standard)',
    },
  },
  plugins: [
    /**
     * Custom plugin to convert `text-style` design token to the `font` css shorthand property
     * as there is no mapping provided by the core plugins.
     */
    plugin(function ({ matchUtilities, theme }) {
      matchUtilities(
        {
          'text-style': (value) => ({
            font: value,
          }),
        },
        { values: theme('textStyle') }
      );
    }),
    /**
     * Custom plugin to convert `shadow` design token to the `boxShadow` css shorthand property
     * and to avoid functionality of core Tailwind CSS plugins (`boxShadow` and `boxShadowColor`).
     */
    plugin(function ({ matchUtilities, theme }) {
      matchUtilities(
        {
          shadow: (value) => ({
            boxShadow: value,
          }),
        },
        { values: flattenShadows(theme('shadow')) }
      );
    }),
  ],
  corePlugins: {
    boxShadow: false,
    boxShadowColor: false,
  },
};
