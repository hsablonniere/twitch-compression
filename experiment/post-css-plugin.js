import fs from 'fs';
import crypto from 'crypto';

const propertiesJson = fs.readFileSync('css-common.json', 'utf8');
const properties = JSON.parse(propertiesJson);

function toBinary (nb) {
  return nb.toString(2).padStart(8, '0');
}

function toDecimal (binaryString) {
  return parseInt(binaryString, 2);
}

async function getHash (message) {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hash = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hash));
  const hashNumber1 = ((hashArray[0] * hashArray[1]) * 0.8) + 400;
  const hashNumber2 = ((hashArray[2] * hashArray[3]) * 0.8) + 400;
  const hashCharacter = String.fromCharCode(hashNumber1, hashNumber2);
  return hashCharacter;
}

const propToKeys = {};
for (const prop of properties) {
  const key = await getHash(prop);
  propToKeys[prop] = key;
}

// console.log(propToKeys);

export const plugin = () => ({
  postcssPlugin: 'postcss-hash-props',
  async Once (root) {
    const promises = [];
    // Transform CSS AST here
    root.walkRules(rule => {
      // Transform each rule here
      rule.walkDecls(decl => {
        // Transform each property declaration here
        if (properties.includes(decl.prop)) {
          promises.push(getHash(decl.prop).then((hash) => {
            if (decl.prop.length > 1) {
              return decl.prop = hash;
            }
          }));
        }

      });
    });

    await Promise.all(promises);
  },
});

// plugin.postcss = true;
//
// module.exports = plugin;
