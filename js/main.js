// Main application logic

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    populateCipherSelects();
    setupSearchFunctionality();
    setupCharacterCounters();
    setupKeyboardShortcuts();
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
function setupCharacterCounters() {
    const decodeInput = document.getElementById('decodeInput');
    const encodeInput = document.getElementById('encodeInput');
    const decodeCounter = document.getElementById('decodeCharCount');
    const encodeCounter = document.getElementById('encodeCharCount');
    
    decodeInput.addEventListener('input', function() {
        updateCharCounter(this.value.length, decodeCounter);
    });
    
    encodeInput.addEventListener('input', function() {
        updateCharCounter(this.value.length, encodeCounter);
    });
}

function setupKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + Enter to decode (when in decode textarea)
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            const activeElement = document.activeElement;
            
            if (activeElement.id === 'decodeInput') {
                e.preventDefault();
                performDecode();
            } else if (activeElement.id === 'encodeInput') {
                e.preventDefault();
                performEncode();
            }
        }
        
        // Ctrl/Cmd + Shift + D for auto-detect
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'D') {
            e.preventDefault();
            document.getElementById('decodeInput').focus();
            autoDetectDecode();
        }
        
        // Ctrl/Cmd + Shift + A for encode all
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'A') {
            e.preventDefault();
            document.getElementById('encodeInput').focus();
            encodeAll();
        }
    });
}

function updateCharCounter(length, counterElement) {
    counterElement.textContent = `${length.toLocaleString()} / 50,000`;
    
    if (length > 45000) {
        counterElement.style.color = '#ff6347';
    } else if (length > 40000) {
        counterElement.style.color = '#ffa500';
    } else {
        counterElement.style.color = '#666';
    }
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
        { text: "cmd.exe%20%2Fc%20%22whoami%22", cipher: "url" },
        { text: "01001000 01100001 01100011 01101011", cipher: "binary" }
    ];
    
    const example = examples[index];
    document.getElementById('decodeInput').value = example.text;
    document.getElementById('decodeCipher').value = example.cipher;
}

// Perform decoding operation
function performDecode() {
    const input = document.getElementById('decodeInput').value.trim();
    const cipherId = document.getElementById('decodeCipher').value;
    const button = event.target;
    
    if (!input) {
        displayDecodeOutput('Please enter text to decode');
        return;
    }

    // Set loading state
    setButtonLoading(button, true);

    // Use setTimeout to allow UI to update
    setTimeout(() => {
        try {
            // Security check
            securityCheck(input, 'decode');
            
            // Sanitize input
            const cleanInput = sanitizeInput(input);
            
            // Get cipher implementation
            const cipher = Ciphers[cipherId];
            if (!cipher || !cipher.decode) {
                displayDecodeOutput('Cipher not supported or decode not available');
                return;
            }
            
            // Perform decoding
            const result = cipher.decode(cleanInput);
            
            // Sanitize and display output
            const safeOutput = sanitizeOutput(result);
            displayDecodeOutput(result, true);  // NEW: added success param
            
            // Check for threats
            checkForThreats(result);
        
   } catch (error) {
            displayDecodeOutput('Decoding failed: ' + error.message);
        } finally {
            //Remove loading state
            setButtonLoading(button, false);
        }
    }, 50);
}

// Auto-detect cipher type by trying multiple methods
function autoDetectDecode() {
    const input = document.getElementById('decodeInput').value.trim();
    const button = event.target;
    
    if (!input) {
        displayDecodeOutput('Please enter text to decode');
        return;
    }

    setButtonLoading(button, true);

    setTimeout(() => {
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
            
            displayDecodeOutput(results, foundResults > 0);
        } catch (error) {
            displayDecodeOutput('Auto-detection failed: ' + error.message);
        } finally {
            setButtonLoading(button, false);  // NEW
        }
    }, 50);
}

// Perform encoding operation
function performEncode() {
    const input = document.getElementById('encodeInput').value.trim();
    const cipherId = document.getElementById('encodeCipher').value;
    const button = event.target;
    
    if (!input) {
        displayEncodeOutput('Please enter text to encode');
        return;
    }

    // Set loading state
    setButtonLoading(button, true);

    // Use setTimeout to allow UI to update
    setTimeout(() => {
        try {
            // Security check
            securityCheck(input, 'encode');
            
            // Sanitize input
            const cleanInput = sanitizeInput(input);
            
            // Get cipher implementation
            const cipher = Ciphers[cipherId];
            if (!cipher || !cipher.encode) {
                displayEncodeOutput('Cipher not supported');
                return;
            }
            
            // Perform encoding
            const result = cipher.encode(cleanInput);
            
            // Sanitize and display output
            const safeOutput = sanitizeOutput(result);
            displayEncodeOutput(result, true);  // Added success param
            
        } catch (error) {
            displayEncodeOutput('Encoding failed: ' + error.message);
        } finally {
            setButtonLoading(button, false); // Remove loading state
        }
    }, 50);
}
        

// Encode with all available methods
function encodeAll() {
    const input = document.getElementById('encodeInput').value.trim();
    const button = event.target;
    
    if (!input) {
        displayEncodeOutput('Please enter text to encode');
        return;
    }
    
    setButtonLoading(button, true);
    
    setTimeout(() => {
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
            
            displayEncodeOutput(results, true);
            
        } catch (error) {
            displayEncodeOutput('Encode all failed: ' + error.message);
        } finally {
            setButtonLoading(button, false);
        }
    }, 50);
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
function displayDecodeOutput(text, isSuccess = false, isError = false) {
    const outputElement = document.getElementById('decodeOutputText');
    const outputBox = document.getElementById('decodeOutput');
    
    outputElement.textContent = text;
    
    // Remove previous states
    outputBox.classList.remove('success', 'error');
    
    if (isSuccess) {
        outputBox.classList.add('success');
        setTimeout(() => outputBox.classList.remove('success'), 300);
    } else if (isError) {
        outputBox.classList.add('error');
    }
}

function displayEncodeOutput(text, isSuccess = false, isError = false) {
    const outputElement = document.getElementById('encodeOutputText');
    const outputBox = document.getElementById('encodeOutput');
    
    outputElement.textContent = text;
    
    // Remove previous states
    outputBox.classList.remove('success', 'error');
    
    if (isSuccess) {
        outputBox.classList.add('success');
        setTimeout(() => outputBox.classList.remove('success'), 300);
    } else if (isError) {
        outputBox.classList.add('error');
    }
}

function setButtonLoading(button, isLoading) {
    if (isLoading) {
        button.disabled = true;
        button.dataset.originalText = button.textContent;
        button.innerHTML = '<span class="spinner"></span>' + button.dataset.originalText;
    } else {
        button.disabled = false;
        button.textContent = button.dataset.originalText;
    }
}

// Copy output to clipboard
function copyOutput(type) {
    const textElement = type === 'decode' ? 
        document.getElementById('decodeOutputText') : 
        document.getElementById('encodeOutputText');
    const text = textElement.textContent;
    
    navigator.clipboard.writeText(text).then(() => {
        const btn = event.target;
        const originalText = btn.textContent;
        btn.textContent = 'Copied!';
        setTimeout(() => {
            btn.textContent = originalText;
        }, 2000);
    }).catch(err => {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
    });
}

// Clear functions
function clearDecode() {
    document.getElementById('decodeInput').value = '';
    document.getElementById('decodeOutputText').textContent = 'Your decoded text will show up here...';
    document.getElementById('decodeWarnings').innerHTML = '';
}

function clearEncode() {
    document.getElementById('encodeInput').value = '';
    document.getElementById('encodeOutputText').textContent = 'Your encoded text will appear here...';
}

// Helper function to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
