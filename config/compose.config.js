const { PREFIX, OUTPUT_PATH, OUTPUT_BASE_FILENAME } = process.env;
const WHITELABEL = process.env.WHITELABEL !== 'false';

const composeObjectTransformGroup = [
    'color/composeColor',
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