// Decoding functions for all supported cipher methods

// Base64 decoder - handles standard base64 and PowerShell encoded commands
function decodeBase64(input) {
    let base64String = input;
    // PowerShell often uses "-enc" flag before base64 data
    if (input.toLowerCase().includes('-enc')) {
        base64String = input.split(/\s+/).pop();
    }
    return atob(base64String);
}

// Hex decoder - converts hexadecimal pairs back to characters
function decodeHex(input) {
    // Strip out any formatting (spaces, colons, etc)
    const cleanInput = input.replace(/[^0-9A-Fa-f]/g, '');
    // Process pairs of hex digits
    return cleanInput.match(/.{1,2}/g)
        .map(byte => String.fromCharCode(parseInt(byte, 16)))
        .join('');
}

// URL decoder - handles percent-encoded characters
function decodeURL(input) {
    return decodeURIComponent(input);
}

// ROT13 decoder - shifts each letter by 13 positions
// Note: ROT13 is its own inverse (encoding = decoding)
function decodeROT13(input) {
    return input.replace(/[a-zA-Z]/g, function(c) {
        const start = c <= 'Z' ? 65 : 97;
        return String.fromCharCode(start + (c.charCodeAt(0) - start + 13) % 26);
    });
}

// ASCII decoder - converts decimal ASCII values to characters
function decodeASCII(input) {
    // Split on non-digit characters (spaces, commas, etc)
    return input.split(/\D+/)
        .filter(num => num)
        .map(num => String.fromCharCode(parseInt(num)))
        .join('');
}

// Morse code decoder - converts dots and dashes to text
function decodeMorse(input) {
    // Split on spaces and map each morse sequence to its character
    return input.split(' ')
        .map(code => morseToChar[code] || '?')
        .join('');
}
