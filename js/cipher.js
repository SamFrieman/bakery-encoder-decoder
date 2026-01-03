// Complete cipher implementations for encoding and decoding
// All 100+ cipher methods organized by category

const CipherRegistry = {
    // Master list of all available ciphers with metadata
    ciphers: [
        // Base Encodings
        { id: 'base64', name: 'Base64', category: 'Base Encodings', bidirectional: true },
        { id: 'base32', name: 'Base32', category: 'Base Encodings', bidirectional: true },
        { id: 'base16', name: 'Base16 (Hex)', category: 'Base Encodings', bidirectional: true },
        { id: 'base85', name: 'Base85 (Ascii85)', category: 'Base Encodings', bidirectional: true },
        { id: 'base58', name: 'Base58 (Bitcoin)', category: 'Base Encodings', bidirectional: true },
        { id: 'base91', name: 'Base91', category: 'Base Encodings', bidirectional: true },
        { id: 'base62', name: 'Base62', category: 'Base Encodings', bidirectional: true },
        { id: 'base45', name: 'Base45', category: 'Base Encodings', bidirectional: true },
        { id: 'base36', name: 'Base36', category: 'Base Encodings', bidirectional: true },

        // URL and Web Encodings
        { id: 'url', name: 'URL Encoding', category: 'Web Encodings', bidirectional: true },
        { id: 'html', name: 'HTML Entities', category: 'Web Encodings', bidirectional: true },
        { id: 'unicode', name: 'Unicode Escape', category: 'Web Encodings', bidirectional: true },
        { id: 'punycode', name: 'Punycode', category: 'Web Encodings', bidirectional: true },
        
        // Binary and Numeric
        { id: 'binary', name: 'Binary', category: 'Numeric', bidirectional: true },
        { id: 'octal', name: 'Octal', category: 'Numeric', bidirectional: true },
        { id: 'decimal', name: 'Decimal (ASCII)', category: 'Numeric', bidirectional: true },
        { id: 'hex', name: 'Hexadecimal', category: 'Numeric', bidirectional: true },
        
        // ROT Ciphers (1-25)
        ...Array.from({length: 25}, (_, i) => ({
            id: `rot${i+1}`,
            name: `ROT${i+1}`,
            category: 'Substitution',
            bidirectional: true
        })),

        // Classic Ciphers
        { id: 'caesar', name: 'Caesar Cipher', category: 'Substitution', bidirectional: true },
        { id: 'atbash', name: 'Atbash', category: 'Substitution', bidirectional: true },
        { id: 'affine', name: 'Affine Cipher', category: 'Substitution', bidirectional: true },
        { id: 'vigenere', name: 'Vigenère Cipher', category: 'Substitution', bidirectional: true },
        { id: 'playfair', name: 'Playfair', category: 'Substitution', bidirectional: true },
        { id: 'polybius', name: 'Polybius Square', category: 'Substitution', bidirectional: true },
        { id: 'bacon', name: 'Bacon Cipher', category: 'Substitution', bidirectional: true },
        { id: 'morse', name: 'Morse Code', category: 'Substitution', bidirectional: true },
