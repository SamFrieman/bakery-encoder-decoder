// Main application logic

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    populateCipherSelects();
    setupSearchFunctionality();
    setupCharCounters();
});

// Populate both encode and decode cipher dropdowns
function populateCipherSelects() {
    const decodeSelect = document.getElementById('decodeCipher');
    const encodeSelect = document.getElementById('encodeCipher');
    
    // Clear existing options
    decodeSelect.innerHTML = '';
    encodeSelect.innerHTML = '';
    
    // Group ciphers by category for better organization
    const categories = {};
    CipherRegistry.ciphers.forEach(cipher => {
        if (!categories[cipher.category]) {
            categories[cipher.category] = [];
        }
        categories[cipher.category].push(cipher);
    });
    
    // Add options grouped by category
    Object.keys(categories).sort().forEach(category => {
        // Decode dropdown only gets bidirectional ciphers
        const decodeGroup = document.createElement('optgroup');
        decodeGroup.label = category;
        categories[category].filter(c => c.bidirectional).forEach(cipher => {
            const option = document.createElement('option');
            option.value = cipher.id;
            option.textContent = cipher.name;
            decodeGroup.appendChild(option);
        });
        if (decodeGroup.children.length > 0) {
            decodeSelect.appendChild(decodeGroup);
        }
        
        // Encode dropdown gets all ciphers
        const encodeGroup = document.createElement('optgroup');
        encodeGroup.label = category;
        categories[category].forEach(cipher => {
            const option = document.createElement('option');
            option.value = cipher.id;
            option.textContent = cipher.name;
            encodeGroup.appendChild(option);
        });
        encodeSelect.appendChild(encodeGroup);
    });
}

// Setup search functionality for cipher dropdowns
function setupSearchFunctionality() {
    const decodeSearch = document.getElementById('decodeSearch');
    const encodeSearch = document.getElementById('encodeSearch');
    const decodeSelect = document.getElementById('decodeCipher');
    const encodeSelect = document.getElementById('encodeCipher');
    
    // Filter decode ciphers
    decodeSearch.addEventListener('input', function() {
        filterCipherSelect(this.value.toLowerCase(), decodeSelect);
    });
    
    // Filter encode ciphers
    encodeSearch.addEventListener('input', function() {
        filterCipherSelect(this.value.toLowerCase(), encodeSelect);
    });
}

// Setup character counters
function setupCharCounters() {
    const decodeInput = document.getElementById('decodeInput');
    const encodeInput = document.getElementById('encodeInput');
    const decodeCharCount = document.getElementById('decodeCharCount');
    const encodeCharCount = document.getElementById('encodeCharCount');
    
    decodeInput.addEventListener('input', function() {
        decodeCharCount.textContent = `${this.value.length} / 50,000`;
    });
    
    encodeInput.addEventListener('input', function() {
        encodeCharCount.textContent = `${this.value.length} / 50,000`;
    });
}

// Filter cipher select dropdown based on search term
function filterCipherSelect(searchTerm, selectElement) {
    const options = selectElement.getElementsByTagName('option');
    const optgroups = selectElement.getElementsByTagName('optgroup');
    
    // Show all if search is empty
    if (!searchTerm) {
        Array.from(optgroups).forEach(group => group.style.display = '');
        Array.from(options).forEach(option => option.style.display = '');
        return;
    }
    
    // Filter options
    Array.from(options).forEach(option => {
        const text = option.textContent.toLowerCase();
        option.style.display = text.includes(searchTerm) ? '' : 'none';
    });
    
    // Hide empty optgroups
    Array.from(optgroups).forEach(group => {
        const visibleOptions = Array.from(group.getElementsByTagName('option'))
            .some(opt => opt.style.display !== 'none');
        group.style.display = visibleOptions ? '' : 'none';
    });
}

// Load example into decode section
function loadExample(index) {
    const examples = [
        { text: "V3JpdGUtSG9zdCAiTWFsaWNpb3VzIGNvZGUgZGV0ZWN0ZWQi", cipher: "base64" },
        { text: "49 6e 76 6f 6b 65 2d 57 65 62 52 65 71 75 65 73 74", cipher: "hex" },
        { text: "Uryyb Jbeyq", cipher: "rot13" }
    ];
    
    const example = examples[index];
    document.getElementById('decodeInput').value = example.text;
    document.getElementById('decodeCipher').value = example.cipher;
    document.getElementById('decodeCharCount').textContent = `${example.text.length} / 50,000`;
}

// Perform decoding operation
function performDecode() {
    const input = document.getElementById('decodeInput').value.trim();
    const cipherId = document.getElementById('decodeCipher').value;
    
    if (!input) {
        displayDecodeOutput('Please enter text to decode', true);
        return;
    }
    
    if (!cipherId) {
        displayDecodeOutput('Please select a cipher method', true);
        return;
    }
    
    try {
        // Security check
        securityCheck(input, 'decode');
        
        // Sanitize input
        const cleanInput = sanitizeInput(input);
        
        // Get cipher implementation
        const cipher = Ciphers[cipherId];
        if (!cipher || !cipher.decode) {
            displayDecodeOutput('Cipher not supported or decode not available', true);
            return;
        }
        
        // Perform decoding
        const result = cipher.decode(cleanInput);
        
        // Sanitize and display output
        const safeOutput = sanitizeOutput(result);
        displayDecodeOutput(result, false);
        
        // Check for threats
        checkForThreats(result);
        
    } catch (error) {
        displayDecodeOutput('Decoding failed: ' + error.message, true);
    }
}

// Auto-detect cipher type by trying multiple methods
function autoDetectDecode() {
    const input = document.getElementById('decodeInput').value.trim();
    
    if (!input) {
        displayDecodeOutput('Please enter text to decode', true);
        return;
    }
    
    try {
        securityCheck(input, 'decode');
        const cleanInput = sanitizeInput(input);
        
        let results = '=== AUTO-DETECTION RESULTS ===\n\n';
        let foundResults = 0;
        
        // Try only the most common bidirectional ciphers
        const commonCiphers = ['base64', 'hex', 'url', 'binary', 'rot13', 'decimal', 'morse', 'reverse'];
        
        commonCiphers.forEach(cipherId => {
            try {
                const cipher = Ciphers[cipherId];
                if (cipher && cipher.decode) {
                    const decoded = cipher.decode(cleanInput);
                    
                    // Only show if result contains readable ASCII
                    if (decoded && /[\x20-\x7E]/.test(decoded)) {
                        results += `${cipherId.toUpperCase()}:\n${decoded}\n\n`;
                        foundResults++;
                    }
                }
            } catch (e) {
                // Skip failed decodings silently
            }
        });
        
        if (foundResults === 0) {
            results = 'No readable output detected from common cipher methods.';
        }
        
        displayDecodeOutput(results, false);
        
    } catch (error) {
        displayDecodeOutput('Auto-detection failed: ' + error.message, true);
    }
}

// Perform encoding operation
function performEncode() {
    const input = document.getElementById('encodeInput').value.trim();
    const cipherId = document.getElementById('encodeCipher').value;
    
    if (!input) {
        displayEncodeOutput('Please enter text to encode', true);
        return;
    }
    
    if (!cipherId) {
        displayEncodeOutput('Please select a cipher method', true);
        return;
    }
    
    try {
        // Security check
        securityCheck(input, 'encode');
        
        // Sanitize input
        const cleanInput = sanitizeInput(input);
        
        // Get cipher implementation
        const cipher = Ciphers[cipherId];
        if (!cipher || !cipher.encode) {
            displayEncodeOutput('Cipher not supported', true);
            return;
        }
        
        // Perform encoding
        const result = cipher.encode(cleanInput);
        
        // Sanitize and display output
        const safeOutput = sanitizeOutput(result);
        displayEncodeOutput(result, false);
        
    } catch (error) {
        displayEncodeOutput('Encoding failed: ' + error.message, true);
    }
}

// Encode with all available methods
function encodeAll() {
    const input = document.getElementById('encodeInput').value.trim();
    
    if (!input) {
        displayEncodeOutput('Please enter text to encode', true);
        return;
    }
    
    try {
        securityCheck(input, 'encode');
        const cleanInput = sanitizeInput(input);
        
        let results = '=== ENCODED WITH ALL CIPHERS ===\n\n';
        
        // Only use implemented ciphers
        const implementedCiphers = [
            'base64', 'base32', 'base16', 'base58', 'base85',
            'hex', 'binary', 'octal', 'decimal',
            'url', 'html', 'unicode',
            'rot13', 'caesar', 'atbash', 'morse', 'reverse', 'bacon'
        ];
        
        implementedCiphers.forEach(cipherId => {
            try {
                const cipher = Ciphers[cipherId];
                if (cipher && cipher.encode) {
                    const encoded = cipher.encode(cleanInput);
                    results += `${cipherId.toUpperCase()}:\n${encoded}\n\n`;
                }
            } catch (e) {
                results += `${cipherId.toUpperCase()}: Encoding failed\n\n`;
            }
        });
        
        displayEncodeOutput(results, false);
        
    } catch (error) {
        displayEncodeOutput('Encode all failed: ' + error.message, true);
    }
}

// Check decoded text for potentially dangerous commands
function checkForThreats(decodedText) {
    const dangerousCommands = [
        'Invoke-WebRequest', 'IWR', 'wget', 'curl',
        'Invoke-Expression', 'IEX',
        'DownloadString', 'DownloadFile',
        'Start-Process',
        'net user', 'net localgroup',
        'reg add', 'reg delete',
        'schtasks', 'wmic', 'certutil', 'bitsadmin',
        'powershell', 'cmd.exe',
        'rundll32', 'mshta',
        'whoami', 'systeminfo'
    ];
    
    const warnings = [];
    const lowerText = decodedText.toLowerCase();
    
    dangerousCommands.forEach(cmd => {
        if (lowerText.includes(cmd.toLowerCase())) {
            warnings.push(`Found: ${escapeHtml(cmd)}`);
        }
    });
    
    const warningsDiv = document.getElementById('decodeWarnings');
    if (warnings.length > 0) {
        warningsDiv.innerHTML = `
            <div class="warning">
                <div class="warning-title">SUSPICIOUS CONTENT DETECTED</div>
                ${warnings.join('<br>')}
                <div style="margin-top: 12px; font-size: 0.9em;">
                    This decoded content contains commands often seen in malicious scripts.
                    Proceed with extreme caution.
                </div>
            </div>
        `;
    } else {
        warningsDiv.innerHTML = '';
    }
}

// Display functions
function displayDecodeOutput(text, isEmpty) {
    const outputBox = document.getElementById('decodeOutput');
    const outputText = document.getElementById('decodeOutputText');
    outputText.textContent = text;
    
    if (isEmpty) {
        outputBox.classList.add('empty');
    } else {
        outputBox.classList.remove('empty');
    }
}

function displayEncodeOutput(text, isEmpty) {
    const outputBox = document.getElementById('encodeOutput');
    const outputText = document.getElementById('encodeOutputText');
    outputText.textContent = text;
    
    if (isEmpty) {
        outputBox.classList.add('empty');
    } else {
        outputBox.classList.remove('empty');
    }
}

// Copy output to clipboard
function copyOutput(type) {
    const textElement = type === 'decode' ? 
        document.getElementById('decodeOutputText') : 
        document.getElementById('encodeOutputText');
    const text = textElement.textContent;
    
    const btn = event.target;
    
    navigator.clipboard.writeText(text).then(() => {
        const originalText = btn.textContent;
        btn.textContent = '✓ Copied';
        btn.classList.add('copied');
        setTimeout(() => {
            btn.textContent = originalText;
            btn.classList.remove('copied');
        }, 2000);
    }).catch(err => {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        
        const originalText = btn.textContent;
        btn.textContent = '✓ Copied';
        btn.classList.add('copied');
        setTimeout(() => {
            btn.textContent = originalText;
            btn.classList.remove('copied');
        }, 2000);
    });
}

// Clear functions
function clearDecode() {
    document.getElementById('decodeInput').value = '';
    document.getElementById('decodeCharCount').textContent = '0 / 50,000';
    displayDecodeOutput('Your decoded text will show up here...', true);
    document.getElementById('decodeWarnings').innerHTML = '';
}

function clearEncode() {
    document.getElementById('encodeInput').value = '';
    document.getElementById('encodeCharCount').textContent = '0 / 50,000';
    displayEncodeOutput('Your encoded text will appear here...', true);
}

// Helper function to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
