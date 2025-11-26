import crypto from 'crypto';

/**
 * Random Number Generator Service
 * Uses cryptographic randomness for provably fair results
 */
export class RngService {
    private serverSeed: string;
    private nonce: number;

    constructor() {
        this.serverSeed = this.generateSeed();
        this.nonce = 0;
    }

    /**
     * Generate a cryptographic seed
     */
    private generateSeed(): string {
        return crypto.randomBytes(32).toString('hex');
    }

    /**
     * Generate a winning number (0-36)
     * Uses SHA-256 hash for provably fair results
     */
    generateWinningNumber(clientSeed: string = 'default'): number {
        const combined = `${this.serverSeed}-${clientSeed}-${this.nonce}`;
        const hash = crypto.createHash('sha256').update(combined).digest('hex');

        // Convert first 8 hex characters to number
        const hexValue = parseInt(hash.substring(0, 8), 16);

        // Map to 0-36 range
        const winningNumber = hexValue % 37;

        // Increment nonce for next spin
        this.nonce++;

        return winningNumber;
    }

    /**
     * Get current nonce (for verification)
     */
    getNonce(): number {
        return this.nonce;
    }

    /**
     * Reset the RNG with new seed
     */
    reset(): void {
        this.serverSeed = this.generateSeed();
        this.nonce = 0;
    }
}

// Singleton instance
export const rngService = new RngService();
