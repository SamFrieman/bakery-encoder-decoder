// Cipher Reference Documentation

const CipherDescriptions = {
    // Base Encodings
    'base64': 'Standard Base64 encoding commonly used in email attachments, web APIs, and data URIs. Converts binary data to ASCII text using 64 characters (A-Z, a-z, 0-9, +, /).',
    'base32': 'Base32 encoding using RFC 4648 standard. More compact than Base64 but case-insensitive, making it useful for systems that don\'t distinguish between upper and lowercase.',
    'base16': 'Also known as hexadecimal encoding. Converts each byte to two hex characters (0-9, A-F). Commonly used in debugging and displaying binary data.',
    'base85': 'ASCII85 encoding that\'s more space-efficient than Base64. Often used in PDF files and PostScript. Encodes 4 bytes into 5 ASCII characters.',
    'base58': 'Bitcoin\'s encoding scheme that excludes confusing characters (0, O, I, l). Used in cryptocurrency addresses to prevent transcription errors.',
    'base62': 'URL-safe encoding using alphanumeric characters only (A-Z, a-z, 0-9). Commonly used for shortening URLs and generating unique identifiers.',
    'base36': 'Case-insensitive encoding using 0-9 and A-Z. Often used in compact representations and some URL shorteners.',
    
    // Web Encodings
    'url': 'URL/percent encoding that escapes special characters for use in web URLs. Converts unsafe characters to %XX format where XX is hexadecimal.',
    'html': 'HTML entity encoding that converts special characters (<, >, &, etc.) to their HTML entity equivalents to prevent XSS attacks and display issues.',
    'unicode': 'Unicode escape sequences (\\uXXXX) that represent characters by their Unicode code points. Commonly used in JSON and JavaScript strings.',
    
    // Numeric Encodings
    'binary': 'Binary representation converting each character to 8-bit binary (0s and 1s). Fundamental encoding used in computer systems.',
    'octal': 'Octal (base-8) representation using digits 0-7. Sometimes used in Unix file permissions and escape sequences.',
    'decimal': 'Decimal ASCII values representing each character by its numeric ASCII code (0-255).',
    'hex': 'Hexadecimal representation of bytes. Each byte is represented by two hex digits (00-FF). Widely used in programming and security analysis.',
    
    // Classic Ciphers
    'caesar': 'Traditional Caesar cipher with a shift of 3. Named after Julius Caesar who reportedly used it for military communications. Simple substitution cipher.',
    'atbash': 'Ancient Hebrew cipher that reverses the alphabet. A becomes Z, B becomes Y, etc. Used in biblical texts and one of the oldest known ciphers.',
    'morse': 'International Morse code representing characters as dots and dashes. Invented by Samuel Morse for telegraph communication in the 1830s.',
    'bacon': 'Bacon\'s cipher invented by Francis Bacon in 1605. Uses only two distinct symbols (typically A and B in 5-character groups) to encode each letter through steganography.',
    
    // Transposition Ciphers
    'reverse': 'Simply reverses the order of characters in the text. The first character becomes last, second becomes second-to-last, etc. Basic transposition cipher.',
    'railfence': 'Rail Fence cipher writes text in a zigzag pattern across multiple "rails" then reads off each rail sequentially. Creates a transposition of the original text.'
};

// Category descriptions and metadata
const CategoryInfo = {
    'Base Encodings': {
        description: 'Base encoding schemes convert binary data into text using a specific set of characters. Commonly used for data transmission and storage where binary data needs to be represented as text.',
        subtitle: '7 encoding methods'
    },
    'Web Encodings': {
        description: 'Encodings specifically designed for web technologies to safely transmit and display data in URLs, HTML documents, and web applications.',
        subtitle: '3 encoding methods'
    },
    'Numeric': {
        description: 'Numeric representations of text data using various number systems. Essential for understanding how computers store and process text internally.',
        subtitle: '4 encoding methods'
    },
    'Substitution': {
        description: 'Substitution ciphers replace each character with another character according to a fixed system. One of the oldest and most widely-used forms of cryptography.',
        subtitle: '29 cipher variations'
    },
    'Transposition': {
        description: 'Transposition ciphers rearrange the order of characters without changing the characters themselves. Security comes from the scrambled order rather than character substitution.',
        subtitle: '2 cipher methods'
    }
};

// Generic descriptions for cipher patterns
const GenericDescriptions = {
    'rot': 'ROT (Rotate) ciphers are Caesar ciphers with different shift values. Each letter in the alphabet is shifted by a fixed number of positions. ROT13 (shift of 13) is the most popular because applying it twice returns the original text. ROT ciphers provide no real security but are useful for obfuscating text from casual reading.'
};

// Populate the cipher reference section
document.addEventListener('DOMContentLoaded', function() {
    populateCipherReference();
});

function populateCipherReference() {
    const container = document.getElementById('cipherCategories');
    if (!container) return;
    
    // Group ciphers by category
    const categories = {};
    CipherRegistry.ciphers.forEach(cipher => {
        if (!categories[cipher.category]) {
            categories[cipher.category] = [];
        }
        categories[cipher.category].push(cipher);
    });
    
    // Create category sections
    Object.keys(categories).sort().forEach(categoryName => {
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'cipher-category';
        
        // Category header
        const headerDiv = document.createElement('div');
        headerDiv.className = 'category-header';
        headerDiv.onclick = function() {
            toggleCategory(this);
        };
        
        const titleWrapper = document.createElement('div');
        titleWrapper.className = 'category-title-wrapper';
        
        const title = document.createElement('h3');
        title.textContent = categoryName;
        
        const subtitle = document.createElement('div');
        subtitle.className = 'category-subtitle';
        subtitle.textContent = CategoryInfo[categoryName]?.subtitle || '';
        
        const toggle = document.createElement('span');
        toggle.className = 'category-toggle';
        toggle.textContent = '▼';
        
        titleWrapper.appendChild(title);
        titleWrapper.appendChild(subtitle);
        headerDiv.appendChild(titleWrapper);
        headerDiv.appendChild(toggle);
        
        // Category content
        const contentDiv = document.createElement('div');
        contentDiv.className = 'category-ciphers';
        
        // Add category overview if available
        if (CategoryInfo[categoryName]?.description) {
            const overviewDiv = document.createElement('div');
            overviewDiv.className = 'category-overview';
            
            const overviewText = document.createElement('div');
            overviewText.className = 'category-overview-text';
            overviewText.textContent = CategoryInfo[categoryName].description;
            
            overviewDiv.appendChild(overviewText);
            contentDiv.appendChild(overviewDiv);
        }
        
        // Group similar ciphers
        const groupedCiphers = groupSimilarCiphers(categories[categoryName]);
        
        // Add cipher items
        groupedCiphers.forEach(group => {
            const cipherItem = document.createElement('div');
            cipherItem.className = 'cipher-item';
            
            const cipherName = document.createElement('div');
            cipherName.className = 'cipher-name';
            cipherName.textContent = group.displayName;
            
            const cipherDesc = document.createElement('div');
            cipherDesc.className = 'cipher-description';
            cipherDesc.textContent = group.description;
            
            cipherItem.appendChild(cipherName);
            cipherItem.appendChild(cipherDesc);
            contentDiv.appendChild(cipherItem);
        });
        
        categoryDiv.appendChild(headerDiv);
        categoryDiv.appendChild(contentDiv);
        container.appendChild(categoryDiv);
    });
}

function groupSimilarCiphers(ciphers) {
    const groups = [];
    const rotCiphers = [];
    
    ciphers.forEach(cipher => {
        // Check if it's a ROT cipher (rot1-rot25)
        if (/^rot\d+$/.test(cipher.id)) {
            rotCiphers.push(cipher);
        } else {
            // Add individual cipher
            groups.push({
                displayName: cipher.name,
                description: CipherDescriptions[cipher.id] || 'No description available.',
                ciphers: [cipher]
            });
        }
    });
    
    // Add grouped ROT ciphers if any exist
    if (rotCiphers.length > 0) {
        groups.push({
            displayName: `ROT Ciphers (ROT1-ROT25)`,
            description: GenericDescriptions['rot'],
            ciphers: rotCiphers
        });
    }
    
    return groups;
}

function toggleCategory(headerElement) {
    const contentDiv = headerElement.nextElementSibling;
    const isCollapsed = contentDiv.classList.contains('collapsed');
    
    if (isCollapsed) {
        contentDiv.classList.remove('collapsed');
        headerElement.classList.remove('collapsed');
    } else {
        contentDiv.classList.add('collapsed');
        headerElement.classList.add('collapsed');
    }
}
