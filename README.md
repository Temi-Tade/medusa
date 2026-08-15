# Medusa

### Seal your files in stone.

A lossless, client-side file encryption tool.  
Encrypt any file into a self-contained `.medusa` container.  
Decrypt only with the key.

No servers. No cloud. No accounts.

---

*Disclaimer: This tool is provided "as is". The author is not liable for data loss. Test decryption before deleting originals.*

---

## Features

- **Lossless**: Original filename and mime type are preserved.
- **Portable**: `.medusa` files are self-describing and can be shared.
- **Client-Side Only**: 100% browser. Your password never leaves your device.
- **XOR Core**: Fast symmetric XOR encryption. v1. Later versions will have more industry-grade techniques.
- **Zero Dependencies**: Vanilla JS + Web APIs only

### Security Model

**v1 Uses XOR**  
- Medusa v1 uses a XOR encryption technique.
- This provides casual privacy and obfuscation. It is not resistant to known-plaintext or frequency attacks.  
- Do not use for classified, financial, or other high-sensitivity data.
- The goal of v1 is speed, simplicity, and a stable file format. Future versions will be drop-in compatible via the header version field.
- Use at your own risk. Keep backups.

### Quick Start

Web App
1. Open `index.html` in Chrome, Firefox, or Edge
2. Drop file → Enter password → Save `file.ext.medusa`
3. Drop `.medusa` → Enter password → Get original file back

> Wrong password = corrupted output. There is no password hint or recovery.

### Development
```bash
git clone https://github.com/yourname/medusa
cd medusa
```
Open index.html. No build, no install.

*Project Structure*
```bash
├── index.html
├── src/
    └── style.css
    └── main.js
├── lib/
    └── lib functions 
├── style.css
└── public/
    └── medusa.png
```

### Contributing
PRs welcome for: UI, performance, tests, CLI port.  
For crypto changes, open an issue first. v1 stays XOR.

### License

MIT © 2026
