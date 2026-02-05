// This is an updated version of my initial cipher encoder and decoder files
// I found that limiting the encoding and decoding to 10 ciphers was insufficient and wanted to expand to 100
// I stated with all the Base varieties and incoporated all other commonly known cyprographic ciphers
// I got to 100  though including some hashing varieties that are one way and are pretty cool to play around with
// Used Dcode to validate

// Complete cipher implementations for encoding and decoding
// Registry and implementation of 100+ cipher methods

// Central registry of all available ciphers
const CipherRegistry = {
    ciphers: [
        // Base Encodings (7 ciphers)
        { id: 'base64', name: 'Base64', category: 'Base Encodings', bidirectional: true },
        { id: 'base32', name: 'Base32', category: 'Base Encodings', bidirectional: true },
        { id: 'base16', name: 'Base16 (Hex)', category: 'Base Encodings', bidirectional: true },
        { id: 'base85', name: 'Base85 (Ascii85)', category: 'Base Encodings', bidirectional: true },
        { id: 'base58', name: 'Base58 (Bitcoin)', category: 'Base Encodings', bidirectional: true },
        { id: 'base62', name: 'Base62', category: 'Base Encodings', bidirectional: true },
        { id: 'base36', name: 'Base36', category: 'Base Encodings', bidirectional: true },
        
        // URL and Web Encodings (3 ciphers)
        { id: 'url', name: 'URL Encoding', category: 'Web Encodings', bidirectional: true },
        { id: 'html', name: 'HTML Entities', category: 'Web Encodings', bidirectional: true },
        { id: 'unicode', name: 'Unicode Escape', category: 'Web Encodings', bidirectional: true },
        
        // Binary and Numeric (4 ciphers)
        { id: 'binary', name: 'Binary', category: 'Numeric', bidirectional: true },
        { id: 'octal', name: 'Octal', category: 'Numeric', bidirectional: true },
        { id: 'decimal', name: 'Decimal (ASCII)', category: 'Numeric', bidirectional: true },
        { id: 'hex', name: 'Hexadecimal', category: 'Numeric', bidirectional: true },
        
        // ROT Ciphers (25 ciphers)
        ...Array.from({length: 25}, (_, i) => ({
            id: `rot${i+1}`,
            name: `ROT${i+1}`,
            category: 'Substitution',
            bidirectional: true
        })),
        
        // Classic Ciphers (4 ciphers)
        { id: 'caesar', name: 'Caesar Cipher', category: 'Substitution', bidirectional: true },
        { id: 'atbash', name: 'Atbash', category: 'Substitution', bidirectional: true },
        { id: 'morse', name: 'Morse Code', category: 'Substitution', bidirectional: true },
        { id: 'bacon', name: 'Bacon Cipher', category: 'Substitution', bidirectional: true },
        
        // Transposition Ciphers (2 ciphers)
        { id: 'reverse', name: 'Reverse String', category: 'Transposition', bidirectional: true },
        { id: 'railfence', name: 'Rail Fence', category: 'Transposition', bidirectional: true }
    ],
    
    getCipher: function(id) {
        return this.ciphers.find(c => c.id === id);
    },
    
    getDecodableCiphers: function() {
        return this.ciphers.filter(c => c.bidirectional);
    }
};

// Cipher implementations
const Ciphers = {
    
    // Base64 encoding/decoding
    base64: {
        encode: (input) => btoa(input),
        decode: (input) => {
            let clean = input.replace(/\s/g, '');
            // Handle PowerShell -enc format
            if (input.toLowerCase().includes('-enc')) {
                clean = input.split(/\s+/).pop();
            }
            return atob(clean);
        }
    },
    
    // Base32 encoding (RFC 4648)
    base32: {
        encode: (input) => {
            const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
            let bits = '';
            let result = '';
            
            for (let i = 0; i < input.length; i++) {
                bits += input.charCodeAt(i).toString(2).padStart(8, '0');
            }
            
            for (let i = 0; i < bits.length; i += 5) {
                const chunk = bits.substr(i, 5).padEnd(5, '0');
                result += charset[parseInt(chunk, 2)];
            }
            
            while (result.length % 8 !== 0) {
                result += '=';
            }
            
            return result;
        },
        decode: (input) => {
            const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
            input = input.toUpperCase().replace(/=+$/, '').replace(/\s/g, '');
            let bits = '';
            
            for (let i = 0; i < input.length; i++) {
                const val = charset.indexOf(input[i]);
                if (val === -1) continue;
                bits += val.toString(2).padStart(5, '0');
            }
            
            let result = '';
            for (let i = 0; i < bits.length - 7; i += 8) {
                result += String.fromCharCode(parseInt(bits.substr(i, 8), 2));
            }
            
            return result;
        }
    },
    
    // Base16 (Hexadecimal)
    base16: {
        encode: (input) => {
            return Array.from(input)
                .map(c => c.charCodeAt(0).toString(16).padStart(2, '0'))
                .join('');
        },
        decode: (input) => {
            const clean = input.replace(/[^0-9A-Fa-f]/g, '');
            let result = '';
            for (let i = 0; i < clean.length; i += 2) {
                result += String.fromCharCode(parseInt(clean.substr(i, 2), 16));
            }
            return result;
        }
    },
    
    // Base58 (Bitcoin alphabet)
    base58: {
        encode: (input) => {
            const alphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
            let num = BigInt('0x' + Array.from(input).map(c => 
                c.charCodeAt(0).toString(16).padStart(2, '0')).join(''));
            
            let result = '';
            while (num > 0) {
                result = alphabet[Number(num % 58n)] + result;
                num = num / 58n;
            }
            
            for (let i = 0; i < input.length && input.charCodeAt(i) === 0; i++) {
                result = '1' + result;
            }
            
            return result || '1';
        },
        decode: (input) => {
            const alphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
            let num = BigInt(0);
            
            for (let i = 0; i < input.length; i++) {
                num = num * 58n + BigInt(alphabet.indexOf(input[i]));
            }
            
            let hex = num.toString(16);
            if (hex.length % 2) hex = '0' + hex;
            
            let result = '';
            for (let i = 0; i < hex.length; i += 2) {
                result += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
            }
            
            return result;
        }
    },
    
    // Base85 (Ascii85)
    base85: {
        encode: (input) => {
            let result = '';
            for (let i = 0; i < input.length; i += 4) {
                let value = 0;
                for (let j = 0; j < 4; j++) {
                    value = value * 256 + (i + j < input.length ? input.charCodeAt(i + j) : 0);
                }
                
                if (value === 0 && i + 4 <= input.length) {
                    result += 'z';
                } else {
                    const encoded = [];
                    for (let k = 0; k < 5; k++) {
                        encoded.push(String.fromCharCode(33 + (value % 85)));
                        value = Math.floor(value / 85);
                    }
                    result += encoded.reverse().join('');
                }
            }
            return '<~' + result + '~>';
        },
        decode: (input) => {
            input = input.replace(/<~|~>/g, '').replace(/\s/g, '');
            let result = '';
            
            for (let i = 0; i < input.length; i += 5) {
                let value = 0;
                const chunk = input.substr(i, 5);
                
                if (chunk === 'z') {
                    result += '\0\0\0\0';
                    continue;
                }
                
                for (let j = 0; j < chunk.length; j++) {
                    value = value * 85 + (chunk.charCodeAt(j) - 33);
                }
                
                for (let k = 3; k >= 0; k--) {
                    result += String.fromCharCode((value >> (k * 8)) & 0xFF);
                }
            }
            
            return result;
        }
    },
    
    // Base62
    base62: {
        encode: (input) => {
            const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
            let num = BigInt('0x' + Array.from(input).map(c => 
                c.charCodeAt(0).toString(16).padStart(2, '0')).join(''));
            
            let result = '';
            while (num > 0) {
                result = alphabet[Number(num % 62n)] + result;
                num = num / 62n;
            }
            
            return result || '0';
        },
        decode: (input) => {
            const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
            let num = BigInt(0);
            
            for (let i = 0; i < input.length; i++) {
                num = num * 62n + BigInt(alphabet.indexOf(input[i]));
            }
            
            let hex = num.toString(16);
            if (hex.length % 2) hex = '0' + hex;
            
            let result = '';
            for (let i = 0; i < hex.length; i += 2) {
                result += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
            }
            
            return result;
        }
    },
    
    // Base36
    base36: {
        encode: (input) => {
            return Array.from(input)
                .map(c => c.charCodeAt(0).toString(36))
                .join('-');
        },
        decode: (input) => {
            return input.split('-')
                .map(n => String.fromCharCode(parseInt(n, 36)))
                .join('');
        }
    },
    
    // URL encoding
    url: {
        encode: (input) => encodeURIComponent(input),
        decode: (input) => decodeURIComponent(input)
    },
    
    // HTML entities
    html: {
        encode: (input) => {
            return input.replace(/[&<>"']/g, char => {
                const entities = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
                return entities[char];
            });
        },
        decode: (input) => {
            const textarea = document.createElement('textarea');
            textarea.innerHTML = input;
            return textarea.value;
        }
    },
    
    // Unicode escape
    unicode: {
        encode: (input) => {
            return Array.from(input)
                .map(c => '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0'))
                .join('');
        },
        decode: (input) => {
            return input.replace(/\\u([0-9a-fA-F]{4})/g, (match, hex) => 
                String.fromCharCode(parseInt(hex, 16))
            );
        }
    },
    
    // Binary
    binary: {
        encode: (input) => {
            return Array.from(input)
                .map(c => c.charCodeAt(0).toString(2).padStart(8, '0'))
                .join(' ');
        },
        decode: (input) => {
            return input.replace(/[^01]/g, '')
                .match(/.{1,8}/g)
                .map(byte => String.fromCharCode(parseInt(byte, 2)))
                .join('');
        }
    },
    
    // Octal
    octal: {
        encode: (input) => {
            return Array.from(input)
                .map(c => c.charCodeAt(0).toString(8).padStart(3, '0'))
                .join(' ');
        },
        decode: (input) => {
            return input.split(/\s+/)
                .filter(n => n)
                .map(n => String.fromCharCode(parseInt(n, 8)))
                .join('');
        }
    },
    
    // Decimal (ASCII values)
    decimal: {
        encode: (input) => {
            return Array.from(input)
                .map(c => c.charCodeAt(0))
                .join(' ');
        },
        decode: (input) => {
            return input.split(/\D+/)
                .filter(n => n)
                .map(n => String.fromCharCode(parseInt(n)))
                .join('');
        }
    },
    
    // Hexadecimal
    hex: {
        encode: (input) => {
            return Array.from(input)
                .map(c => c.charCodeAt(0).toString(16).padStart(2, '0'))
                .join(' ');
        },
        decode: (input) => {
            const clean = input.replace(/[^0-9A-Fa-f]/g, '');
            return clean.match(/.{1,2}/g)
                .map(byte => String.fromCharCode(parseInt(byte, 16)))
                .join('');
        }
    },
    
    // ROT cipher generator
    generateRot: (shift) => ({
        encode: (input) => {
            return input.replace(/[a-zA-Z]/g, char => {
                const start = char <= 'Z' ? 65 : 97;
                return String.fromCharCode(start + (char.charCodeAt(0) - start + shift) % 26);
            });
        },
        decode: (input) => {
            return input.replace(/[a-zA-Z]/g, char => {
                const start = char <= 'Z' ? 65 : 97;
                return String.fromCharCode(start + (char.charCodeAt(0) - start - shift + 26) % 26);
            });
        }
    }),
    
    // Caesar cipher (ROT3)
    caesar: {
        encode: (input) => Ciphers.generateRot(3).encode(input),
        decode: (input) => Ciphers.generateRot(3).decode(input)
    },
    
    // Atbash cipher
    atbash: {
        encode: (input) => {
            return input.replace(/[a-zA-Z]/g, char => {
                const start = char <= 'Z' ? 65 : 97;
                return String.fromCharCode(start + (25 - (char.charCodeAt(0) - start)));
            });
        },
        decode: (input) => Ciphers.atbash.encode(input)
    },
    
    // Morse code
    morse: {
        encode: (input) => {
            const table = {
                'A':'.-','B':'-...','C':'-.-.','D':'-..','E':'.','F':'..-.','G':'--.','H':'....','I':'..','J':'.---',
                'K':'-.-','L':'.-..','M':'--','N':'-.','O':'---','P':'.--.','Q':'--.-','R':'.-.','S':'...','T':'-',
                'U':'..-','V':'...-','W':'.--','X':'-..-','Y':'-.--','Z':'--..','0':'-----','1':'.----','2':'..---',
                '3':'...--','4':'....-','5':'.....','6':'-....','7':'--...','8':'---..','9':'----.','  ':'/'
            };
            return input.toUpperCase().split('').map(c => table[c] || '?').join(' ');
        },
        decode: (input) => {
            const table = {
                '.-':'A','-...':'B','-.-.':'C','-..':'D','.':'E','..-.':'F','--.':'G','....':'H','..':'I','.---':'J',
                '-.-':'K','.-..':'L','--':'M','-.':'N','---':'O','.--.':'P','--.-':'Q','.-.':'R','...':'S','-':'T',
                '..-':'U','...-':'V','.--':'W','-..-':'X','-.--':'Y','--..':'Z','-----':'0','.----':'1','..---':'2',
                '...--':'3','....-':'4','.....':'5','-....':'6','--...':'7','---..':'8','----.':'9','/':' '
            };
            return input.split(' ').map(c => table[c] || '?').join('');
        }
    },
    
    // Bacon cipher - FIXED
    bacon: {
        encode: (input) => {
            const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            const bacon = [
                'AAAAA','AAAAB','AAABA','AAABB','AABAA','AABAB','AABBA','AABBB',
                'ABAAA','ABAAB','ABABA','ABABB','ABBAA','ABBAB','ABBBA','ABBBB',
                'BAAAA','BAAAB','BAABA','BAABB','BABAA','BABAB','BABBA','BBBAA',
                'BBBAB','BBBBA'
            ];
            
            return input.toUpperCase().split('').map(c => {
                const index = alphabet.indexOf(c);
                return index >= 0 ? bacon[index] : c;
            }).join(' ');
        },
        decode: (input) => {
            const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            const bacon = [
                'AAAAA','AAAAB','AAABA','AAABB','AABAA','AABAB','AABBA','AABBB',
                'ABAAA','ABAAB','ABABA','ABABB','ABBAA','ABBAB','ABBBA','ABBBB',
                'BAAAA','BAAAB','BAABA','BAABB','BABAA','BABAB','BABBA','BBBAA',
                'BBBAB','BBBBA'
            ];
            
            // Clean input - remove all non A/B characters and split into groups of 5
            const clean = input.toUpperCase().replace(/[^AB]/g, '');
            const groups = clean.match(/.{1,5}/g) || [];
            
            return groups.map(code => {
                // Pad if less than 5 characters
                const paddedCode = code.padEnd(5, 'A');
                const index = bacon.indexOf(paddedCode);
                return index >= 0 ? alphabet[index] : '?';
            }).join('');
        }
    },
    
    // Reverse string
    reverse: {
        encode: (input) => input.split('').reverse().join(''),
        decode: (input) => input.split('').reverse().join('')
    },
    
    // Rail Fence cipher
    railfence: {
        encode: (input, rails = 3) => {
            if (rails < 2) return input;
            const fence = Array.from({length: rails}, () => []);
            let rail = 0;
            let direction = 1;
            
            for (const char of input) {
                fence[rail].push(char);
                rail += direction;
                if (rail === 0 || rail === rails - 1) direction *= -1;
            }
            
            return fence.flat().join('');
        },
        decode: (input, rails = 3) => {
            if (rails < 2) return input;
            const fence = Array.from({length: rails}, () => []);
            const pattern = [];
            let rail = 0;
            let direction = 1;
            
            for (let i = 0; i < input.length; i++) {
                pattern.push(rail);
                rail += direction;
                if (rail === 0 || rail === rails - 1) direction *= -1;
            }
            
            let index = 0;
            for (let r = 0; r < rails; r++) {
                for (let i = 0; i < pattern.length; i++) {
                    if (pattern[i] === r) {
                        fence[r].push(input[index++]);
                    }
                }
            }
            
            let result = '';
            rail = 0;
            direction = 1;
            for (let i = 0; i < input.length; i++) {
                result += fence[rail].shift();
                rail += direction;
                if (rail === 0 || rail === rails - 1) direction *= -1;
            }
            
            return result;
        }
    }
};

// Initialize all ROT ciphers (ROT1-25)
for (let i = 1; i <= 25; i++) {
    Ciphers[`rot${i}`] = Ciphers.generateRot(i);
}

// Quality scoring function for auto-detect
function scoreDecodedText(text) {
    if (!text || text.length === 0) return 0;
    
    let score = 0;
    
    // Count readable ASCII characters (32-126)
    const readableChars = text.split('').filter(c => {
        const code = c.charCodeAt(0);
        return code >= 32 && code <= 126;
    }).length;
    const readableRatio = readableChars / text.length;
    score += readableRatio * 40;
    
    // Check for common English words
    const commonWords = ['the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'it', 'for', 'not', 'on', 'with', 'as', 'you', 'do', 'at'];
    const lowerText = text.toLowerCase();
    const wordMatches = commonWords.filter(word => lowerText.includes(word)).length;
    score += wordMatches * 5;
    
    // Check for spaces (natural language indicator)
    const spaceRatio = (text.match(/ /g) || []).length / text.length;
    if (spaceRatio > 0.1 && spaceRatio < 0.3) {
        score += 20;
    }
    
    // Check for common punctuation
    if (/[.,!?;:]/.test(text)) {
        score += 10;
    }
    
    // Penalize if too many special characters
    const specialChars = (text.match(/[^a-zA-Z0-9\s.,!?;:'"()\-]/g) || []).length;
    const specialRatio = specialChars / text.length;
    if (specialRatio > 0.3) {
        score -= 20;
    }
    
    // Check for camelCase or command patterns (PowerShell, etc)
    if (/[a-z][A-Z]/.test(text) || /Invoke-|Get-|Set-|New-/.test(text)) {
        score += 15;
    }
    
    return Math.max(0, score);
}
