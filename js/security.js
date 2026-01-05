// Security utilities and input validation

function sanitizeInput(input) {
    if (typeof input !== 'string') {
        return '';
    }
    
    const maxLength = 50000;
    if (input.length > maxLength) {
        input = input.substring(0, maxLength);
    }
    
    return input;
}

function sanitizeOutput(output) {
    if (typeof output !== 'string') {
        return '';
    }
    
    const div = document.createElement('div');
    div.textContent = output;
    return div.innerHTML;
}

function validateCipherInput(input, cipherType) {
    if (!input || typeof input !== 'string') {
        return false;
    }
    
    const validationPatterns = {
        'base64': /^[A-Za-z0-9+/=\s-]*$/,
        'hex': /^[0-9A-Fa-f\s:,-]*$/,
        'binary': /^[01\s]*$/,
        'octal': /^[0-7\s]*$/,
        'decimal': /^[0-9\s,.-]*$/,
        'morse': /^[\.\-\s/]*$/
    };
    
    const pattern = validationPatterns[cipherType] || /^[\x20-\x7E\s]*$/;
    return pattern.test(input);
}

const rateLimiter = {
    requests: [],
    maxRequests: 100,
    timeWindow: 60000,
    
    canProceed: function() {
        const now = Date.now();
        this.requests = this.requests.filter(time => now - time < this.timeWindow);
        
        if (this.requests.length >= this.maxRequests) {
            return false;
        }
        
        this.requests.push(now);
        return true;
    }
};

function securityCheck(input, operation) {
    if (!rateLimiter.canProceed()) {
        throw new Error('Rate limit exceeded. Please wait before trying again.');
    }
    
    if (input.length > 50000) {
        throw new Error('Input too large. Maximum 50,000 characters allowed.');
    }
    
    const dangerousPatterns = [
        /<script[^>]*>.*?<\/script>/gi,
        /javascript:/gi,
        /on\w+\s*=/gi,
        /<iframe/gi,
        /<object/gi,
        /<embed/gi
    ];
    
    for (const pattern of dangerousPatterns) {
        if (pattern.test(input)) {
            throw new Error('Invalid input detected.');
        }
    }
    
    return true;
}
