import { readFile } from 'fs/promises'
import { promisify } from 'util'
import { brotliDecompress } from 'zlib'

const pBrotliDecompress = promisify(brotliDecompress)

export async function loadAuthCertificate(x509?: string) {
    let pem: Buffer | undefined
    if (x509) {
        let b64: Buffer | undefined
        let file: Buffer | undefined
        try {
            const enc = Buffer.from(x509, 'base64')
            b64 = await pBrotliDecompress(enc)
        } catch (_e) { }
        if (!b64)
            try {
                file = await readFile(x509)
            } catch (_e) { }

        pem = b64 || file
        if (!pem)
            // Only emit the first 50 characters to prevent sensitive data leak
            throw new Error(`Unrecognised certificate '${x509.length > 50
                ? `${x509.substr(0, 50)}...`
                : x509
                }'`)
    }

    return pem
}
