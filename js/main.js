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

// Auto-detect cipher type with high accuracy scoring
function autoDetectDecode() {
    const input = document.getElementById('decodeInput').value.trim();
    
    if (!input) {
        displayDecodeOutput('Please enter text to decode', true);
        return;
    }
    
    try {
        securityCheck(input, 'decode');
        const cleanInput = sanitizeInput(input);
        
        // Analyze input characteristics for pre-filtering
        const inputAnalysis = analyzeInput(cleanInput);
        
        // Get prioritized cipher list based on input characteristics
        const ciphersToTry = prioritizeCiphers(inputAnalysis);
        
        // Try each cipher and score the results
        const decodedResults = [];
        
        ciphersToTry.forEach(cipherId => {
            try {
                const cipher = Ciphers[cipherId];
                if (cipher && cipher.decode) {
                    const decoded = cipher.decode(cleanInput);
                    const score = scoreDecodedText(decoded);
                    
                    // Only include results with reasonable scores
                    if (score > 20) {
                        decodedResults.push({
                            cipher: cipherId,
                            decoded: decoded,
                            score: score,
                            confidence: calculateConfidence(score, inputAnalysis, cipherId)
                        });
                    }
                }
            } catch (e) {
                // Skip failed decodings silently
            }
        });
        
        // Sort by confidence score (highest first)
        decodedResults.sort((a, b) => b.confidence - a.confidence);
        
        // Display results
        if (decodedResults.length === 0) {
            displayDecodeOutput('No high-confidence decoding detected. The input may be encrypted, corrupted, or use an unsupported cipher.', true);
            return;
        }
        
        // Show top 3 results with confidence scores
        let results = '=== AUTO-DETECTION RESULTS ===\n';
        results += '(Sorted by confidence - highest probability first)\n\n';
        
        const topResults = decodedResults.slice(0, 3);
        topResults.forEach((result, index) => {
            const confidenceBar = generateConfidenceBar(result.confidence);
            results += `${index + 1}. ${result.cipher.toUpperCase()} ${confidenceBar}\n`;
            results += `   Confidence: ${result.confidence.toFixed(1)}%\n`;
            results += `   Result: ${result.decoded.substring(0, 200)}${result.decoded.length > 200 ? '...' : ''}\n\n`;
        });
        
        // Add recommendation
        if (topResults[0].confidence >= 85) {
            results += `\n✓ HIGH CONFIDENCE: ${topResults[0].cipher.toUpperCase()} is very likely correct.`;
        } else if (topResults[0].confidence >= 65) {
            results += `\n⚠ MODERATE CONFIDENCE: ${topResults[0].cipher.toUpperCase()} is probably correct, but verify the output.`;
        } else {
            results += `\n⚠ LOW CONFIDENCE: Multiple ciphers possible. Manual verification recommended.`;
        }
        
        displayDecodeOutput(results, false);
        
        // Check top result for threats
        if (topResults[0].confidence >= 65) {
            checkForThreats(topResults[0].decoded);
        }
        
    } catch (error) {
        displayDecodeOutput('Auto-detection failed: ' + error.message, true);
    }
}

// Analyze input to determine likely cipher types
function analyzeInput(input) {
    const analysis = {
        length: input.length,
        hasSpaces: /\s/.test(input),
        hasUppercase: /[A-Z]/.test(input),
        hasLowercase: /[a-z]/.test(input),
        hasDigits: /[0-9]/.test(input),
        hasSpecialChars: /[^a-zA-Z0-9\s]/.test(input),
        onlyHex: /^[0-9A-Fa-f\s:,-]+$/.test(input),
        onlyBase64: /^[A-Za-z0-9+/=\s-]+$/.test(input),
        onlyBinary: /^[01\s]+$/.test(input),
        onlyOctal: /^[0-7\s]+$/.test(input),
        onlyDecimal: /^[0-9\s,.-]+$/.test(input),
        onlyMorse: /^[\.\-\s/]+$/.test(input),
        onlyAlpha: /^[a-zA-Z\s]+$/.test(input),
        hasPercent: /%[0-9A-Fa-f]{2}/.test(input),
        hasHtmlEntities: /&[a-z]+;|&#[0-9]+;/.test(input),
        hasUnicodeEscape: /\\u[0-9a-fA-F]{4}/.test(input),
        endsWithEquals: /=+$/.test(input.trim()),
        hasBase85Markers: /<~.*~>/.test(input),
        avgWordLength: calculateAvgWordLength(input)
    };
    
    return analysis;
}

// Calculate average word length (useful for detecting encoded text)
function calculateAvgWordLength(input) {
    const words = input.split(/\s+/).filter(w => w.length > 0);
    if (words.length === 0) return 0;
    const totalLength = words.reduce((sum, word) => sum + word.length, 0);
    return totalLength / words.length;
}

// Prioritize which ciphers to try based on input analysis
function prioritizeCiphers(analysis) {
    const prioritized = [];
    
    // High priority based on clear patterns
    if (analysis.onlyBinary) {
        prioritized.push('binary');
    }
    if (analysis.onlyMorse) {
        prioritized.push('morse');
    }
    if (analysis.hasBase85Markers) {
        prioritized.push('base85');
    }
    if (analysis.hasPercent) {
        prioritized.push('url');
    }
    if (analysis.hasHtmlEntities) {
        prioritized.push('html');
    }
    if (analysis.hasUnicodeEscape) {
        prioritized.push('unicode');
    }
    
    // Base64 detection (improved)
    if (analysis.onlyBase64 && analysis.length % 4 === 0) {
        prioritized.push('base64');
    } else if (analysis.onlyBase64 && analysis.endsWithEquals) {
        prioritized.push('base64');
    }
    
    // Hex detection
    if (analysis.onlyHex && !analysis.hasUppercase && !analysis.hasLowercase) {
        prioritized.push('hex');
    } else if (analysis.onlyHex) {
        prioritized.push('hex', 'base16');
    }
    
    // Numeric encodings
    if (analysis.onlyOctal) {
        prioritized.push('octal');
    }
    if (analysis.onlyDecimal && analysis.hasSpaces) {
        prioritized.push('decimal');
    }
    
    // ROT/Caesar ciphers (only if alphabetic)
    if (analysis.onlyAlpha && analysis.avgWordLength > 3 && analysis.avgWordLength < 8) {
        prioritized.push('rot13', 'caesar', 'atbash');
        // Add other common ROT values
        prioritized.push('rot1', 'rot5', 'rot7', 'rot18', 'rot25');
    }
    
    // Base32 (all uppercase letters and digits 2-7)
    if (/^[A-Z2-7=\s]+$/.test(analysis.onlyBase64)) {
        prioritized.push('base32');
    }
    
    // Bacon cipher (only A and B)
    if (/^[ABab\s]+$/.test(analysis.onlyAlpha)) {
        prioritized.push('bacon');
    }
    
    // Add remaining common ciphers if nothing specific detected
    const commonDefaults = ['base64', 'hex', 'url', 'base32', 'decimal', 'rot13', 'reverse'];
    commonDefaults.forEach(cipher => {
        if (!prioritized.includes(cipher)) {
            prioritized.push(cipher);
        }
    });
    
    // Add less common ciphers
    const lessCommon = ['base58', 'base62', 'base36', 'binary', 'octal', 'morse', 'railfence'];
    lessCommon.forEach(cipher => {
        if (!prioritized.includes(cipher)) {
            prioritized.push(cipher);
        }
    });
    
    return prioritized;
}

// Calculate confidence percentage based on score and input characteristics
function calculateConfidence(score, inputAnalysis, cipherId) {
    let confidence = score;
    
    // Boost confidence for pattern matches
    if (cipherId === 'base64' && inputAnalysis.onlyBase64 && inputAnalysis.endsWithEquals) {
        confidence += 15;
    }
    if (cipherId === 'hex' && inputAnalysis.onlyHex) {
        confidence += 15;
    }
    if (cipherId === 'binary' && inputAnalysis.onlyBinary) {
        confidence += 20;
    }
    if (cipherId === 'morse' && inputAnalysis.onlyMorse) {
        confidence += 20;
    }
    if (cipherId === 'url' && inputAnalysis.hasPercent) {
        confidence += 15;
    }
    if (cipherId === 'html' && inputAnalysis.hasHtmlEntities) {
        confidence += 15;
    }
    if (cipherId === 'unicode' && inputAnalysis.hasUnicodeEscape) {
        confidence += 20;
    }
    
    // ROT ciphers get bonus for common words
    if (cipherId.startsWith('rot') || cipherId === 'caesar' || cipherId === 'atbash') {
        if (inputAnalysis.onlyAlpha) {
            confidence += 10;
        }
    }
    
    // Penalize unlikely combinations
    if (cipherId === 'reverse' && score < 60) {
        confidence -= 10;
    }
    
    // Cap confidence at 99%
    return Math.min(99, Math.max(0, confidence));
}

// Generate visual confidence bar
function generateConfidenceBar(confidence) {
    const barLength = 20;
    const filledLength = Math.round((confidence / 100) * barLength);
    const bar = '█'.repeat(filledLength) + '░'.repeat(barLength - filledLength);
    return `[${bar}]`;
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
