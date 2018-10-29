function ObisHeader(mbusPackageBuffer) {

    this._headerOffset = 0;
    this._mbusPackageBuffer = mbusPackageBuffer;

    let destinationAddress = this.getAddress(this._mbusPackageBuffer.slice(3, 6)).toString(16);
    let sourceAddress = this.getAddress(this._mbusPackageBuffer.slice(3 + this._headerOffset, 6 + this._headerOffset)).toString(16);
    let controlField = this._mbusPackageBuffer.slice(4 + this._headerOffset, 5 + this._headerOffset).toString('hex');
    let isHeaderValidChecksum = this._mbusPackageBuffer.readUInt16LE(5 + this._headerOffset) == this.computeChecksum(this._mbusPackageBuffer.slice(1, 5 + this._headerOffset));

    // Maybe not part of header, but does not fit anywhere else
    let destinationLSAP = this._mbusPackageBuffer.slice(7 + this._headerOffset, 7 + this._headerOffset + 1).toString('hex');
    let sourceLSAP = this._mbusPackageBuffer.slice(8 + this._headerOffset, 8 + this._headerOffset + 1).toString('hex');
    let llcQuality = this._mbusPackageBuffer.slice(9 + this._headerOffset, 9 + this._headerOffset + 1).toString('hex');

    return {
        isHeaderValidChecksum: isHeaderValidChecksum,
        controlField: controlField,
        sourceAddress: sourceAddress,
        destinationAddress: destinationAddress,
        offset: this._headerOffset + 10
    }
}

ObisHeader.prototype = {
    constructor: ObisHeader,
    computeChecksum: function (buf) {
        var TABLE = [
            0x0000, 0x1189, 0x2312, 0x329b, 0x4624, 0x57ad, 0x6536, 0x74bf,
            0x8c48, 0x9dc1, 0xaf5a, 0xbed3, 0xca6c, 0xdbe5, 0xe97e, 0xf8f7,
            0x1081, 0x0108, 0x3393, 0x221a, 0x56a5, 0x472c, 0x75b7, 0x643e,
            0x9cc9, 0x8d40, 0xbfdb, 0xae52, 0xdaed, 0xcb64, 0xf9ff, 0xe876,
            0x2102, 0x308b, 0x0210, 0x1399, 0x6726, 0x76af, 0x4434, 0x55bd,
            0xad4a, 0xbcc3, 0x8e58, 0x9fd1, 0xeb6e, 0xfae7, 0xc87c, 0xd9f5,
            0x3183, 0x200a, 0x1291, 0x0318, 0x77a7, 0x662e, 0x54b5, 0x453c,
            0xbdcb, 0xac42, 0x9ed9, 0x8f50, 0xfbef, 0xea66, 0xd8fd, 0xc974,
            0x4204, 0x538d, 0x6116, 0x709f, 0x0420, 0x15a9, 0x2732, 0x36bb,
            0xce4c, 0xdfc5, 0xed5e, 0xfcd7, 0x8868, 0x99e1, 0xab7a, 0xbaf3,
            0x5285, 0x430c, 0x7197, 0x601e, 0x14a1, 0x0528, 0x37b3, 0x263a,
            0xdecd, 0xcf44, 0xfddf, 0xec56, 0x98e9, 0x8960, 0xbbfb, 0xaa72,
            0x6306, 0x728f, 0x4014, 0x519d, 0x2522, 0x34ab, 0x0630, 0x17b9,
            0xef4e, 0xfec7, 0xcc5c, 0xddd5, 0xa96a, 0xb8e3, 0x8a78, 0x9bf1,
            0x7387, 0x620e, 0x5095, 0x411c, 0x35a3, 0x242a, 0x16b1, 0x0738,
            0xffcf, 0xee46, 0xdcdd, 0xcd54, 0xb9eb, 0xa862, 0x9af9, 0x8b70,
            0x8408, 0x9581, 0xa71a, 0xb693, 0xc22c, 0xd3a5, 0xe13e, 0xf0b7,
            0x0840, 0x19c9, 0x2b52, 0x3adb, 0x4e64, 0x5fed, 0x6d76, 0x7cff,
            0x9489, 0x8500, 0xb79b, 0xa612, 0xd2ad, 0xc324, 0xf1bf, 0xe036,
            0x18c1, 0x0948, 0x3bd3, 0x2a5a, 0x5ee5, 0x4f6c, 0x7df7, 0x6c7e,
            0xa50a, 0xb483, 0x8618, 0x9791, 0xe32e, 0xf2a7, 0xc03c, 0xd1b5,
            0x2942, 0x38cb, 0x0a50, 0x1bd9, 0x6f66, 0x7eef, 0x4c74, 0x5dfd,
            0xb58b, 0xa402, 0x9699, 0x8710, 0xf3af, 0xe226, 0xd0bd, 0xc134,
            0x39c3, 0x284a, 0x1ad1, 0x0b58, 0x7fe7, 0x6e6e, 0x5cf5, 0x4d7c,
            0xc60c, 0xd785, 0xe51e, 0xf497, 0x8028, 0x91a1, 0xa33a, 0xb2b3,
            0x4a44, 0x5bcd, 0x6956, 0x78df, 0x0c60, 0x1de9, 0x2f72, 0x3efb,
            0xd68d, 0xc704, 0xf59f, 0xe416, 0x90a9, 0x8120, 0xb3bb, 0xa232,
            0x5ac5, 0x4b4c, 0x79d7, 0x685e, 0x1ce1, 0x0d68, 0x3ff3, 0x2e7a,
            0xe70e, 0xf687, 0xc41c, 0xd595, 0xa12a, 0xb0a3, 0x8238, 0x93b1,
            0x6b46, 0x7acf, 0x4854, 0x59dd, 0x2d62, 0x3ceb, 0x0e70, 0x1ff9,
            0xf78f, 0xe606, 0xd49d, 0xc514, 0xb1ab, 0xa022, 0x92b9, 0x8330,
            0x7bc7, 0x6a4e, 0x58d5, 0x495c, 0x3de3, 0x2c6a, 0x1ef1, 0x0f78
        ];

        let fcs = 0xFFFF;
        for (let i = 0; i < buf.length; i++) {
            let ubyte = buf[i];
            let index = (fcs ^ buf[i]) & 0xff;
            fcs = (fcs >> 8) ^ TABLE[index];
        }
        fcs ^= 0xffff;
        return fcs;
    },
    getAddress: function (buf) {
        // This functions is not yet complete. Does not handle _headerOffset
        let i = 1;
        for (; i < 4; i++) {
            this._headerOffset = 1;
            if ((buf.readUInt8(i - 1) & 0x01) == 0x01) {
                break;
            }
        }
        if (i == 1) return buf.readUInt8(0);
        if (i == 2) return buf.readUIn16LE(0);
        if (i == 3) return buf.readUInt32LE(0);
    }
}


function ObisPackageDateTime(mbusPackageBuffer, offset) {

    this._mbusPackageBuffer = mbusPackageBuffer;

    let dateTimeLength = this._mbusPackageBuffer.readUInt8(offset);

    var dateTime = this._mbusPackageBuffer.slice(offset + 5, offset + 5 + dateTimeLength);

    if (dateTime.readUInt8(0) == 0x09) {
        // String format
        let stringLength = dateTime.readUInt8(1);
        this.year = dateTime.readUInt16BE(2);
        this.month = dateTime.readUInt8(4);
        this.date = dateTime.readUInt8(5);
        this.hour = dateTime.readUInt8(6);
        this.minute = dateTime.readUInt8(7);
        this.seconds = dateTime.readUInt8(8);
    }

    this.offset = offset + 5 + dateTimeLength;

    return this;
}

ObisPackageDateTime.prototype = {
    constructor: ObisPackageDateTime
}


function ObisElementsParser(mbusPackageBuffer, offset) {
    this._mbusPackageBuffer = mbusPackageBuffer;
    this.offset = offset;
    this.elements = [];
    let NumberOfElements = this._mbusPackageBuffer.readUInt8(offset);

    this.offset = this.offset + 1;

    for (i = 1; i <= NumberOfElements; i++) {
        let item = this.parseElement();
    }

    return this;
}

ObisElementsParser.prototype = {
    constructor: ObisElementsParser,
    parseElement: function () {
        let obisElement;
        let elementType = this._mbusPackageBuffer.readUInt8(this.offset);
        let elementSize = this._mbusPackageBuffer.readUInt8(this.offset + 1)

        if (elementType == 0x0A) {
            let ListIdentifier = this._mbusPackageBuffer.slice(this.offset + 2, this.offset + 2 + elementSize).toString('ascii');
            this.offset = this.offset + 2 + elementSize;
        }

        if (elementType == 0x09) {
            obisElement = this.parseObisIdentifier();
        }

        return {
            elementType: elementType,
            elementSize: elementSize,
            obisElement: obisElement
        }
    },

    parseObisIdentifier: function () {
        this._obisId =
            this._mbusPackageBuffer.readUInt8(this.offset + 2) + "." +
            this._mbusPackageBuffer.readUInt8(this.offset + 3) + "." +
            this._mbusPackageBuffer.readUInt8(this.offset + 4) + "." +
            this._mbusPackageBuffer.readUInt8(this.offset + 5) + "." +
            this._mbusPackageBuffer.readUInt8(this.offset + 6) + "." +
            this._mbusPackageBuffer.readUInt8(this.offset + 7);

        // MeterId
        if (this._obisId == "1.1.0.0.5.255") {
            this._obisName = "MeterId";
            this._obisValueOffset = 10;
            this._obisSubType = this._mbusPackageBuffer.readUInt8(this.offset + 8);
            this._obisSubTypeLength = this._mbusPackageBuffer.readUInt8(this.offset + 9);
            this._obisValue = parseInt(this._mbusPackageBuffer.slice(this.offset + 10, this.offset + 10 + this._obisSubTypeLength).toString('ascii'));
        }

        // MeterType
        if (this._obisId == "1.1.96.1.1.255") {
            this._obisName = "MeterType";
            this._obisValueOffset = 10;
            this._obisSubType = this._mbusPackageBuffer.readUInt8(this.offset + 8);
            this._obisSubTypeLength = this._mbusPackageBuffer.readUInt8(this.offset + 9);
            this._obisValue = this._mbusPackageBuffer.slice(this.offset + 10, this.offset + 10 + this._obisSubTypeLength).toString('ascii');
        }

        // ActivePower+ // P14
        if (this._obisId == "1.1.1.7.0.255") {
            this._obisName = "ActivePower+";
            this._obisValueOffset = 9;
            this._obisSubType = this._mbusPackageBuffer.readUInt8(this.offset + 8);
            this._obisSubTypeLength = this.getsubTypeLength(this._obisSubType);
            this._obisValue = this._mbusPackageBuffer.readUInt32BE(this.offset + 9);
        }

        // ActivePower- // P21
        if (this._obisId == "1.1.2.7.0.255") {
            this._obisName = "ActivePower-";
            this._obisValueOffset = 9;
            this._obisSubType = this._mbusPackageBuffer.readUInt8(this.offset + 8);
            this._obisSubTypeLength = this.getsubTypeLength(this._obisSubType);
            this._obisValue = this._mbusPackageBuffer.readUInt32BE(this.offset + 9);
        }

        // ReactivePower+
        if (this._obisId == "1.1.3.7.0.255") {
            this._obisName = "ReactivePower+";
            this._obisValueOffset = 9;
            this._obisSubType = this._mbusPackageBuffer.readUInt8(this.offset + 8);
            this._obisSubTypeLength = this.getsubTypeLength(this._obisSubType);
            this._obisValue = this._mbusPackageBuffer.readUInt32BE(this.offset + 9);
        }

        // ReactivePower-
        if (this._obisId == "1.1.4.7.0.255") {
            this._obisName = "ReactivePower-";
            this._obisValueOffset = 9;
            this._obisSubType = this._mbusPackageBuffer.readUInt8(this.offset + 8);
            this._obisSubTypeLength = this.getsubTypeLength(this._obisSubType);
            this._obisValue = this._mbusPackageBuffer.readUInt32BE(this.offset + 9);
        }

        // L1 Current
        if (this._obisId == "1.1.31.7.0.255") {
            this._obisName = "IL1";
            this._obisValueOffset = 9;
            this._obisSubType = this._mbusPackageBuffer.readUInt8(this.offset + 8);
            this._obisSubTypeLength = this.getsubTypeLength(this._obisSubType);
            this._obisValue = this._mbusPackageBuffer.readUInt32BE(this.offset + 9);
        }

        // L2 Current
        if (this._obisId == "1.1.51.7.0.255") {
            this._obisName = "IL2";
            this._obisValueOffset = 9;
            this._obisSubType = this._mbusPackageBuffer.readUInt8(this.offset + 8);
            this._obisSubTypeLength = this.getsubTypeLength(this._obisSubType);
            this._obisValue = this._mbusPackageBuffer.readUInt32BE(this.offset + 9);
        }

        // L3 Current
        if (this._obisId == "1.1.71.7.0.255") {
            this._obisName = "IL3";
            this._obisValueOffset = 9;
            this._obisSubType = this._mbusPackageBuffer.readUInt8(this.offset + 8);
            this._obisSubTypeLength = this.getsubTypeLength(this._obisSubType);
            this._obisValue = this._mbusPackageBuffer.readUInt32BE(this.offset + 9);
        }

        // L1 Voltage
        if (this._obisId == "1.1.32.7.0.255") {
            this._obisName = "UL1";
            this._obisValueOffset = 9;
            this._obisSubType = this._mbusPackageBuffer.readUInt8(this.offset + 8);
            this._obisSubTypeLength = this.getsubTypeLength(this._obisSubType);
            this._obisValue = this._mbusPackageBuffer.readUInt16BE(this.offset + 9);
        }

        // L2 Voltage
        if (this._obisId == "1.1.52.7.0.255") {
            this._obisName = "UL2";
            this._obisValueOffset = 9;
            this._obisSubType = this._mbusPackageBuffer.readUInt8(this.offset + 8);
            this._obisSubTypeLength = this.getsubTypeLength(this._obisSubType);
            this._obisValue = this._mbusPackageBuffer.readUInt16BE(this.offset + 9);
        }

        // L3 Voltage
        if (this._obisId == "1.1.72.7.0.255") {
            this._obisName = "UL3";
            this._obisValueOffset = 9;
            this._obisSubType = this._mbusPackageBuffer.readUInt8(this.offset + 8);
            this._obisSubTypeLength = this.getsubTypeLength(this._obisSubType);
            this._obisValue = this._mbusPackageBuffer.readUInt16BE(this.offset + 9);
        }

        // Set new offset
        this.offset = this.offset + this._obisValueOffset + this._obisSubTypeLength

        // Update elements array
        this.elements.push({
            _obisId: this._obisId,
            _obisName: this._obisName,
            _obisValue: this._obisValue
        })
    },

    getsubTypeLength: function (type) {
        if (type == 0x06) return 4;
        if (type == 0x12) return 2;
    }
}

exports.ObisHeader = ObisHeader;
exports.ObisElementsParser = ObisElementsParser;
exports.ObisPackageDateTime = ObisPackageDateTime;