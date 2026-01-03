// Encoding functions for all supported cipher methods

// Hex encoder - converts each character to hexadecimal
function encodeHex(input) {
    return input.split('')
        .map(c => c.charCodeAt(0).toString(16).padStart(2, '0'))
        .join(' ');
}

// Binary encoder - converts each character to 8-bit binary
function encodeBinary(input) {
    return input.split('')
        .map(c => c.charCodeAt(0).toString(2).padStart(8, '0'))
        .join(' ');
}

// ASCII encoder - shows decimal ASCII value for each character
function encodeASCII(input) {
    return input.split('')
        .map(c => c.charCodeAt(0))
        .join(' ');
}

// Morse encoder - converts text to dots and dashes
function encodeMorse(input) {
    return input.toUpperCase().split('')
        .map(c => charToMorse[c] || '?')
        .join(' ');
}

// Caesar cipher encoder - shifts letters forward by 3
function encodeCaesar(input) {
    return input.replace(/[a-zA-Z]/g, function(c) {
        const start = c <= 'Z' ? 65 : 97;
        return String.fromCharCode(start + (c.charCodeAt(0) - start + 3) % 26);
    });
}
