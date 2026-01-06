# Bakery Encoder/Decoder

A professional cybersecurity tool for encoding and decoding text using 50+ cipher methods. Built for security analysts who frequently encounter encoded malicious commands in real-world attacks.

## Features

- **50+ Cipher Methods** including Base64, Hex, Binary, ROT ciphers, Morse code, and more
- **Auto-Detection** - Automatically tries multiple common ciphers to decode unknown text
- **Encode All** - Encode text with all available ciphers at once
- **Threat Detection** - Warns you when decoded content contains suspicious commands
- **Search Functionality** - Quickly find the cipher you need
- **Cipher Reference Guide** - Complete documentation of all encoding methods
- **Copy to Clipboard** - One-click copy of encoded/decoded results

## Supported Cipher Categories

### Base Encodings (7 methods)
Base64, Base32, Base16 (Hex), Base85 (Ascii85), Base58 (Bitcoin), Base62, Base36

### Web Encodings (3 methods)
URL Encoding, HTML Entities, Unicode Escape

### Numeric (4 methods)
Binary, Octal, Decimal (ASCII), Hexadecimal

### Substitution (29 methods)
ROT1-ROT25, Caesar Cipher, Atbash, Morse Code, Bacon Cipher

### Transposition (2 methods)
Reverse String, Rail Fence

## Quick Start

1. Open `index.html` in your web browser
2. Choose **Decode** or **Encode** section
3. Select a cipher method from the dropdown
4. Paste or type your text
5. Click the Decode/Encode button
6. Copy the result

## Usage Examples

### Decoding Base64
```
Input: V3JpdGUtSG9zdCAiTWFsaWNpb3VzIGNvZGUi
Cipher: Base64
Output: Write-Host "Malicious code"
```

### Auto-Detection
Don't know which cipher was used? Use the **Auto-Detect** button to try multiple common methods automatically.

### Encoding with All Ciphers
Use **Encode All** to see your text encoded with every available cipher - great for learning or testing.

## Security Features

- **Threat Pattern Detection** - Automatically scans decoded content for suspicious commands like:
  - PowerShell commands (Invoke-WebRequest, Invoke-Expression)
  - System commands (whoami, netstat, systeminfo)
  - Registry modifications
  - Common obfuscation techniques

- **Input Sanitization** - All inputs are sanitized to prevent XSS attacks
- **Rate Limiting** - Built-in rate limiting (100 requests per minute)
- **Maximum Input Size** - 50,000 character limit per operation

## Project Structure

```
bakery-decoder/
├── index.html              # Main HTML file
├── styles.css              # All styling
├── js/
│   ├── ciphers.js         # Cipher implementations
│   ├── cipher-reference.js # Reference documentation
│   ├── main.js            # Main application logic
│   ├── config.js          # Configuration constants
│   └── security.js        # Security utilities
└── README.md              # This file
```

## Browser Support

Works on all modern browsers:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## Notes

- All encoding/decoding happens client-side - no data is sent to any server
- Some ciphers (like Rail Fence) use default parameters which can be customized in the code
- The tool is designed for security analysis and educational purposes

## Credits

Crafted by [Sam Frieman](https://github.com/SamFrieman)

## License

Free to use for educational and security analysis purposes.

---

**Warning**: This tool is intended for legitimate security analysis and educational purposes only. Always ensure you have proper authorization before analyzing encoded content.
