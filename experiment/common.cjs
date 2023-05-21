const fs = require('fs');

const chrome = require('./css-chrome.json');
const firefox = require('./css-firefox.json');
const webkit = require('./css-webkit.json');

const filtered = chrome.filter((key) => {
  return firefox.includes(key) && webkit.includes(key);
});

fs.writeFileSync('css-common.json', JSON.stringify(filtered, null, '  '));
