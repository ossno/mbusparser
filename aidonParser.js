var Uint64LE = require("int64-buffer").Uint64LE;

AidonParser.prototype = {
    constructor: AidonParser,
}

function AidonParser(buffer) {
    try {
        let meterId = buffer.slice(0, 16).toString();
        let a_plus = parseInt(new Uint64LE(buffer.slice(16, 24)));
        let a_minus = parseInt(new Uint64LE(buffer.slice(24, 32)));
        let r_plus = parseInt(new Uint64LE(buffer.slice(32, 40)));
        let r_minus = parseInt(new Uint64LE(buffer.slice(40, 48)));
        let p_plus = buffer.readUInt16LE(48);
        let p_minus = buffer.readUInt16LE(52);
        let q_plus = buffer.readUInt16LE(56);
        let q_minus = buffer.readUInt16LE(60);
        let phi1 = buffer.readUInt16LE(64);
        let phi2 = buffer.readUInt16LE(66);
        let phi3 = buffer.readUInt16LE(68);
        let p1 = buffer.readUInt32LE(70);
        let p2 = buffer.readUInt32LE(74);
        let p3 = buffer.readUInt32LE(78);
        let u1 = buffer.readUInt16LE(82);
        let u2 = buffer.readUInt16LE(84)
        let u3 = buffer.readUInt16LE(86);;
        let i1 = buffer.readUInt16LE(88);
        let i2 = buffer.readUInt16LE(90);
        let i3 = buffer.readUInt16LE(92);
        let f = buffer.readUInt16LE(94);
        let phases = buffer.readUInt8(96);

        let o = {
            meterId: meterId,
            a_plus: a_plus,
            a_minus: a_minus,
            r_plus: r_plus,
            r_minus: r_minus,
            p_plus: p_plus,
            p_minus: p_minus,
            q_plus: q_plus,
            q_minus: q_minus,
            phi1: phi1,
            phi2: phi2,
            phi3: phi3,
            p1: p1,
            p2: p2,
            p3: p3,
            u1: u1,
            u2: u2,
            u3: u3,
            i1: i1,
            i2: i2,
            i3: i3,
            f: f,
            phases: phases
        }
        return {type: "aidon", data: o}

    } catch (err) {
        return {
            type: "error", data: "Failed to parse aidon data: " + err.message
        };
    }
}

exports.AidonParser = AidonParser;