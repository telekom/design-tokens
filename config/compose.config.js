const StyleDictionary = require('style-dictionary');
const Color = require('tinycolor2');

const { PREFIX, OUTPUT_PATH, OUTPUT_BASE_FILENAME } = process.env;
const WHITELABEL = process.env.WHITELABEL !== 'false';


StyleDictionary.registerTransform({
  type: 'value',
  name: 'color/composeColor',
  matcher: (token) => token.original.type === 'color',
  transformer: (token) => {
    const hex8 = Color(token.value).toHex8();
    return `Color(0x${hex8})`;
  }
});

StyleDictionary.registerTransform({
  type: 'value',
  name: 'has-alpha',
  transitive: true, 
  transformer: function (token) {
    if (token.value?.alpha != null) {
      const hex = Color(token.value.color.replace('Color(0x', '').slice(0, -3))
      const hex8withAlpha = hex.setAlpha(token.value.alpha)
      token.value = `Color(0x${hex8withAlpha.toHex8()})`;
      return token.value
    } else {
      return token.value;      
    }
  },
});

const composeObjectTransformGroup = [
    'has-alpha',
    'color/composeColor',
    // 'comment/composeStripComments'
  ];

function format(string){
  const dashlessString = string.replace(/-(.)/g, (_, letter) => letter.toUpperCase());
  const upperCasedString = dashlessString.charAt(0).toUpperCase() + dashlessString.slice(1);
  const ampersandRemovedString = upperCasedString.replace(/&/g, 'And')
  return ampersandRemovedString;
}  
  
  
module.exports = {
    include: ['src/core/**/*.json5'],
    source: [
      ...(WHITELABEL === false ? ['src/telekom/core/**.json5'] : []),
      'src/semantic/**/*.json5',
    ],
    platforms: {
      composeObjectLightOnlyData: {
        transforms: ['mode-light', ...composeObjectTransformGroup],
        prefix: PREFIX,
        buildPath: OUTPUT_PATH + 'android-compose/',
        files: [
          {
            destination: OUTPUT_BASE_FILENAME + '.light.kt',
            format: 'compose/object',
            packageName: 'de.telekom.tokens',
            className: 'ScaleTokensLight',
            filter: (token) => {
                if (token.path[0] !== 'core' && !token.path.includes('experimental') && token.type === 'color') {
                  {
                      const formatted = token.path.map(el => format(el))
                      token.name = `Telekom${formatted.toString().replace(/,/g, '')}`
                      // delete token.comment
                      // delete token.original.comment
                      return token
                  }
                }
            }
          },
        ],
      },
      composeObjectDarkOnlyData: {
        transforms: ['mode-dark', ...composeObjectTransformGroup],
        prefix: PREFIX,
        buildPath: OUTPUT_PATH + 'android-compose/',
        files: [
          {
            destination: OUTPUT_BASE_FILENAME + '.dark.kt',
            format: 'compose/object',
            packageName: 'de.telekom.tokens',
            className: 'ScaleTokensDark',
            filter: (token) => {
                if (token.path[0] !== 'core' && token.original.value?.dark != null && token.type === 'color')
                {
                    const formatted = token.path.map(el => format(el))
                    token.name = `Telekom${formatted.toString().replace(/,/g, '')}`
                    return token
                }
            }

          },
        ],
      },
    },
  };