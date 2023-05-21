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

const propListRaw = [];
for (let rawProp in document.body.style) {
  propListRaw.push(rawProp);
}

const propListKebab = propListRaw.map((prop) => prop.replace(/([A-Z])/g, (a) => '-' + a.toLowerCase()));
const propListUnique = Array.from(new Set(propListKebab));
const keysToProp = {};
for (const prop of propListUnique) {
  const key = await getHash(prop);
  keysToProp[key] = prop;
}

const cache = await caches.open('main');
await cache.put(new Request('/keys-to-prop'), new Response(JSON.stringify(keysToProp)));

if ('serviceWorker' in navigator) {
  try {
    const registration = await navigator.serviceWorker.register('../sw.js');
    if (registration.installing) {
      console.log('Service worker installing');
    }
    else if (registration.waiting) {
      console.log('Service worker installed');
    }
    else if (registration.active) {
      console.log('Service worker active');
    }
  }
  catch (error) {
    console.error(`Registration failed with ${error}`);
  }
}
