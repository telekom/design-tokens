# Colors
Colors are categorized into the areas: `text & icon`, `background`, `primary`, `ui`, `functional` and `additional`.

## Text & icons
`Text & icon` tokens should be exclusivly used as text colors and icon colors. Text and icons have very specific contrast needs to fulfill accessibility requirements.
By using the correct tokens from this category you can be assured that contrasts fulfill the required contrast ratios.
### Standard
`Text & icon/Standard` is the main text token used for headlines, copy text and important ui texts & labels.

### Additional
`Text & icon/Additional` is used for additional content that should be a bit de-emphasized. It is also used for placeholder texts, some labels or unselected elements.

### Disabled
`Text & icon/Disabled` is exclusivly used for text of disabled elements. It does not fulfill the contrast ratio for active text, however for disabled elements it is acceptable to not fulfill the contrast according to [wacg specifications; incidental](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum).

### Link
The `Text & Icon/Link` tokens should be used exclusivly for links and the link underline. Make sure to use the correct tokens for the link states `standard`, `hover`, `visited`, `active`.

### Primary
The `Text & Icon/Primary` tokens are used for text that is interactive but not a normal text link and for text as part of an enabled element. E.g. an active menu item.

### Functional
#### Informational, Success, Warning & Danger
These tokens are for text in specific situations:
- `Text & icon/Functional/Informational` is for text that informs about somthing neutral, like an update to the terms of service.
- `Text & icon/Functional/Success` is for text that informs about a success or leads to a confirmatory action like *save*.
- `Text & icon/Functional/Danger` is for text that informs about an error or a dangerous choice like deleting an account or that leads to a destrutive action like _delete_.
- `Text & icon/Functional/Warning` is for text that informs about something that be problematic or inconvenient like a planned outage for maintainence.

#### White & Black
The tokens `Text & icon/Functional/White` & `Text & icon/Functional/Black` are the same colors as the standard colors. The difference is that the color will **not** change between light and dark mode.
This means `Text & icon/Functional/White` is white in light **and** dark mode and `Text & icon/Functional/Black` is black in light **and** dark mode.
Only use those colors were nessesary, e.g. on functional colors or the primary color.

### Inverted
`Text & icon/Inverted/Standard` & `Text & icon/Inverted/Additional` are the opposite of the `Text & icon/Standard` and `Text & icon/Additional`. This means in light mode, where the text is dark, the inverted text colors are light. And in the dark mode, were the normal text is light, the inverted text colors are dark. This should only be used in special situations, e.g. on `ui/strong` and `ui/extra strong`.

## Background
`Background` tokens are used for big background areas on which other components are place.

### Canvas
`Background/Canvas` & `Background/Canvas Subtle` tokens are only used for the background of an app or website.
### Surface
`Background/Surface`, `Background/Surface Subtle` & `Background/Surface Highlight` tokens are used for bigger elements like cards, modals, header or footers that are above the canvas but often contain components.

### Backdrop
The `Background/backdrop` token is used for an overlay that covers the screen below a modal window or similar.

## Primary
`Primary` tokens are used for important parts of the product. This includes the primary action button, an active item in a ui element like a checkbox or an active tab or an enabled element like a toggle switch.
The state tokens `hovered` and `pressed` should only be used to visualize these specific interaction states.
## UI
`UI` tokens are used for borders and backgrounds and parts of ui components like buttons, sliders, switches, inputs, etc.

### Base
The `ui/base` token is used for parts of ui elements that are same / similar in color to the background. For example the knob in a switch or slider.
It may also be used for other purposes that are not covered by any of the other ui colors.

### Subtle
The `ui/subtle` token is mainly used when a background for a ui element is needed that is supposed to have only little contrast to the apps background. It does not fulfill the wacg contrast requirements of 3:1 for ui elements so it should not be used as the only means to visualize a ui element or for important functional aspects. 
It may also be used for other purposes that are not covered by any of the other ui colors.

### Light
The `ui/light` token is mainly used for decorational aspects of ui elements. It does not fulfill the wacg contrast requirements of 3:1 for ui elements so it should not be used as the only means to visualize a ui element or for important functional aspects.
It may also be used for other purposes that are not covered by any of the other ui colors.

### Regular
The `ui/regular` token is used for the main part in many ui elements in the default state. E.g. for the outline of an input field or radio button.
It may also be used for other purposes that are not covered by any of the other ui colors.

### Strong
The `ui/strong` token is used for hover effects, e.g. when a radio button is hovered the outlien changes from `ui/regular` to `ui/strong`.
It may also be used for other purposes that are not covered by any of the other ui colors.

### Extra Strong
The `ui/extra-strong` token is used for pressed effects and when a very strong contrast is needed, e.g. when a radio button is pressed the outlien changes from `ui/regular` to `ui/extra-strong`.
It may also be used for other purposes that are not covered by any of the other ui colors.

### Disabled
The `ui/disabled` token should be used together with the `Text & icon/Disabled` token to create disabled elements. This token must only be used for disabled elements.

## Functional
`Functional` tokens are for specific situation in which they are applied.

### Focus
The `Functional/Focus` token is exclusivly used for the focus ring when navigating with tab or a remote.

### Informational
The `Functional/Informational` tokens are for informative elements like info banners or specific interactive elements like progress bars or sliders.

### Success
The `Functional/Success` tokens are for success elements like confirmation banners or success states, like an outline for an input field with a valid credit card number.

### Danger
The `Functional/Danger` tokens are for errors states like the outline of an invalid text field or a dangerous choice like a deletion button.

### Warning
The `Functional/Warning` tokens are for warnings like a progress bar of data usage that is nearly filled.

## Additional
`Additional` tokens must only be used for specific elements where colors server a more decorational purpose and don't have a semantic meaning.
Some examples are tags or bar charts & graphs.
