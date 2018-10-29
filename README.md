# MBusParser
This package uses Node.js to parse base64 encoded mbus packages.

## Disclaimer
This project is only developed as an example and may break at any time.

## Use with MBusReader
```bash
git clone https://github.com/ossno/mbusreader
cd mbusreader
npm install
node mbusreader.js
```

## Use in your own program
1. In your project directory
```bash
npm install https://github.com/ossno/mbusparser --save
```
2. In your node program
```javascript
const MBusParser = require('./mbusparser');
let parsed = new MBusParser(base64string);
```