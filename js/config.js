// Application configuration and constants

const AppConfig = {
    version: '1.2.0',
    name: 'Bakery Encoder/Decoder',
    maxInputLength: 50000,
    rateLimit: {
        maxRequests: 100,
        timeWindow: 60000
    }
};

const Examples = [
    {
        text: "V3JpdGUtSG9zdCAiTWFsaWNpb3VzIGNvZGUgZGV0ZWN0ZWQi",
        cipher: "base64",
        description: "PowerShell Base64 Command"
    },
    {
        text: "49 6e 76 6f 6b 65 2d 57 65 62 52 65 71 75 65 73 74",
        cipher: "hex",
        description: "Hex Encoded Web Request"
    },
    {
        text: "cmd.exe%20%2Fc%20%22whoami%22",
        cipher: "url",
        description: "URL Encoded CMD Payload"
    },
    {
        text: "01001000 01100001 01100011 01101011",
        cipher: "binary",
        description: "Binary Encoded Message"
    }
];

const ThreatPatterns = {
    powershell: [
        'Invoke-WebRequest',
        'Invoke-Expression',
        'IWR',
        'IEX',
        'DownloadString',
        'DownloadFile',
        'Start-Process',
        'New-Object',
        'Net.WebClient'
    ],
    system: [
        'net user',
        'net localgroup',
        'net group',
        'whoami',
        'systeminfo',
        'ipconfig',
        'tasklist',
        'netstat'
    ],
    registry: [
        'reg add',
        'reg delete',
        'reg query',
        'regedit'
    ],
    scheduled: [
        'schtasks',
        'at.exe',
        'cron'
    ],
    wmi: [
        'wmic',
        'Get-WmiObject',
        'gwmi'
    ],
    obfuscation: [
        'certutil',
        'bitsadmin',
        'rundll32',
        'mshta',
        'regsvr32'
    ],
    executables: [
        'powershell',
        'cmd.exe',
        'bash',
        'sh'
    ]
};

function getAllThreatPatterns() {
    return Object.values(ThreatPatterns).flat();
}
