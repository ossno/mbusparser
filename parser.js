const {
    crc16xmodem
} = require('crc');

const {
    AidonParser
} = require('./aidonParser');
const {
    ObisHeader,
    ObisPackageDateTime,
    ObisElementsParser
} = require('./obisParser');

function Parser(encodedMBusPackage) {
    try {
        this._offset = 0;

        this._encodedMBusPackage = encodedMBusPackage
        this._mbusPackageBuffer = Buffer.from(this._encodedMBusPackage, 'base64');

        let frameStart = this._mbusPackageBuffer.readUInt8(0, 1) == 0x7E;
        let frameEnd = this._mbusPackageBuffer.readUInt8(this._mbusPackageBuffer.length - 1, this._mbusPackageBuffer.length) == 0x7E;

        let frameFormatType = this._mbusPackageBuffer.readUInt8(1) & 0xF0;
        let validFrameFormat = frameFormatType == 0xA0;
        let messageSize = ((this._mbusPackageBuffer.readUInt8(1) & 0x0F) << 8) | this._mbusPackageBuffer.readUInt8(2);


        if (frameStart && frameEnd) {
            // Looks like a mbus obis package

            if (validFrameFormat) {
                this._messageSize = messageSize;

                // Parse header
                this._header = new ObisHeader(this._mbusPackageBuffer)

                if (this._header.isHeaderValidChecksum) {
                    // Valid header

                    // Parse datetime
                    this._packageDateTime = new ObisPackageDateTime(this._mbusPackageBuffer, this._header.offset);

                    // Parse elements
                    this._elements = new ObisElementsParser(this._mbusPackageBuffer, this._packageDateTime.offset);

                    return {
                        type: "obis",
                        data: this._elements.elements
                    };
                } else {
                    return {
                        type: "error",
                        data: "Invalid header checksum"
                    };
                }

            } else {
                return {
                    type: "error",
                    data: "Invalid frame format"
                };
            }
        } else {
            // Check for Aidon custom format

            let END = 0xC0;
            let ESC = 0xDB;
            let ESC_END = 0xDC;
            let ESC_ESC = 0xDD;
            var newBuffer = Buffer.alloc(0);

            let bytesAdded = 0;

            function updateBuffer(byteToAdd) {
                let currentBuffer = Buffer.alloc(1);
                currentBuffer[0] = byteToAdd;
                newBuffer = Buffer.concat([newBuffer, currentBuffer], bytesAdded + 1);
                bytesAdded++;
            }

            // SLIP Decode
            for (let i = 0; i < this._mbusPackageBuffer.length; i++) {
                if (this._mbusPackageBuffer[i] == ESC) {
                    let nextByte = this._mbusPackageBuffer[i + 1];
                    if (nextByte == ESC_END) {
                        updateBuffer(END);
                        i++;
                    } else if (nextByte == ESC_ESC) {
                        updateBuffer(ESC);
                        i++;
                    } else {
                        updateBuffer(this._mbusPackageBuffer[i]);
                    }
                } else {
                    updateBuffer(this._mbusPackageBuffer[i]);
                }
            }
            // CRC Check
            let messageCRC = Buffer.concat([Buffer.from(newBuffer.slice(98, 99)), Buffer.from(newBuffer.slice(97, 98))]).toString('hex');
            var result = crc16xmodem(newBuffer.slice(0, 97)).toString(16);

            if (messageCRC === result) {
                let data = new AidonParser(newBuffer);
                return data;
            } else {
                return {
                    type: "error",
                    data: "aidon data failed crc check"
                };
            }

        }
    } catch (err) {
        return {type: "parser", data: "failed to parse" };
    }
}

Parser.prototype = {
    constructor: Parser,
}

module.exports = Parser;