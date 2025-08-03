const { SDK, HashLock, PrivateKeyProviderConnector, NetworkEnum } = require("@1inch/cross-chain-sdk");
const BitcoinConnector = require('./bitcoin-connector');
const { randomBytes } = require('ethers');

// Extended NetworkEnum to include Bitcoin
const ExtendedNetworkEnum = {
    ...NetworkEnum,
    BITCOIN_TESTNET: 'bitcoin_testnet',
    BITCOIN_MAINNET: 'bitcoin_mainnet'
};

class FusionPlusBitcoin {
    constructor(config) {
        this.config = config;
        this.sdk = new SDK({
            url: 'https://api.1inch.dev/fusion-plus',
            authKey: config.devPortalApiKey,
            blockchainProvider: config.blockchainProvider
        });
        
        // Initialize Bitcoin connector if Bitcoin is involved
        if (this.isBitcoinChain(config.srcChainId) || this.isBitcoinChain(config.dstChainId)) {
            this.bitcoinConnector = new BitcoinConnector(
                config.bitcoinPrivateKey || config.walletKey,
                this.getBitcoinNetwork(config.srcChainId || config.dstChainId)
            );
        }
    }

    isBitcoinChain(chainId) {
        return chainId === ExtendedNetworkEnum.BITCOIN_TESTNET || 
               chainId === ExtendedNetworkEnum.BITCOIN_MAINNET;
    }

    getBitcoinNetwork(chainId) {
        return chainId === ExtendedNetworkEnum.BITCOIN_TESTNET ? 'testnet' : 'mainnet';
    }

    async getQuote(params) {
        // If Bitcoin is involved, we need to handle it differently
        if (this.isBitcoinChain(params.srcChainId) || this.isBitcoinChain(params.dstChainId)) {
            return await this.getBitcoinQuote(params);
        }
        
        // Use standard Fusion+ SDK for EVM chains
        return await this.sdk.getQuote(params);
    }

    async getBitcoinQuote(params) {
        // Create a mock quote for Bitcoin swaps
        // In a real implementation, this would integrate with 1inch's API
        const mockQuote = {
            getPreset: () => ({
                secretsCount: 1
            }),
            srcChainId: params.srcChainId,
            dstChainId: params.dstChainId,
            srcTokenAddress: params.srcTokenAddress,
            dstTokenAddress: params.dstTokenAddress,
            amount: params.amount,
            estimatedAmount: params.amount, // Simplified for demo
            fee: '1000', // Estimated fee
            isBitcoinSwap: true
        };

        return mockQuote;
    }

    async placeOrder(quote, options) {
        if (quote.isBitcoinSwap) {
            return await this.placeBitcoinOrder(quote, options);
        }
        
        return await this.sdk.placeOrder(quote, options);
    }

    async placeBitcoinOrder(quote, options) {
        const { walletAddress, hashLock, secretHashes } = options;
        
        // Create HTLC transaction on Bitcoin
        const htlcTxHex = await this.bitcoinConnector.createHtlcTransaction(
            this.bitcoinConnector.getAddress(),
            parseInt(quote.amount),
            hashLock.hash,
            Math.floor(Date.now() / 1000) + 3600 // 1 hour timelock
        );

        // Broadcast the HTLC transaction
        const txid = await this.bitcoinConnector.broadcastTransaction(htlcTxHex);

        // Create order response
        const orderResponse = {
            orderHash: txid,
            status: 'pending',
            htlcTxid: txid,
            hashLock: hashLock,
            secretHashes: secretHashes
        };

        return orderResponse;
    }

    async getOrderStatus(orderHash) {
        // Check if this is a Bitcoin order
        if (orderHash.startsWith('bitcoin_')) {
            return await this.getBitcoinOrderStatus(orderHash);
        }
        
        return await this.sdk.getOrderStatus(orderHash);
    }

    async getBitcoinOrderStatus(orderHash) {
        try {
            // Get transaction details from Bitcoin network
            const txHex = await this.bitcoinConnector.getTransactionHex(orderHash);
            const tx = require('bitcoinjs-lib').Transaction.fromHex(txHex);
            
            // Check if transaction is confirmed
            const confirmations = await this.getTransactionConfirmations(orderHash);
            
            return {
                status: confirmations > 0 ? 'confirmed' : 'pending',
                confirmations: confirmations,
                txid: orderHash
            };
        } catch (error) {
            return {
                status: 'error',
                error: error.message
            };
        }
    }

    async getTransactionConfirmations(txid) {
        try {
            const response = await require('axios').get(
                `${this.bitcoinConnector.rpcUrl}/tx/${txid}`
            );
            return response.data.status.confirmed ? response.data.status.block_height : 0;
        } catch (error) {
            return 0;
        }
    }

    async getReadyToAcceptSecretFills(orderHash) {
        // For Bitcoin, we'll implement a simplified version
        // In a real implementation, this would check for matching orders
        return {
            fills: []
        };
    }

    async submitSecret(orderHash, secret) {
        if (orderHash.startsWith('bitcoin_')) {
            return await this.submitBitcoinSecret(orderHash, secret);
        }
        
        return await this.sdk.submitSecret(orderHash, secret);
    }

    async submitBitcoinSecret(orderHash, secret) {
        try {
            // Spend the HTLC with the secret
            const result = await this.bitcoinConnector.spendHtlc(
                orderHash,
                secret,
                this.bitcoinConnector.getAddress()
            );
            
            return {
                success: true,
                txid: result
            };
        } catch (error) {
            throw new Error(`Failed to submit Bitcoin secret: ${error.message}`);
        }
    }

    // Utility functions
    generateSecret() {
        return '0x' + Buffer.from(randomBytes(32)).toString('hex');
    }

    generateHashLock(secret) {
        return HashLock.hashSecret(secret);
    }

    async getBitcoinBalance() {
        if (!this.bitcoinConnector) {
            throw new Error('Bitcoin connector not initialized');
        }
        return await this.bitcoinConnector.getBalance();
    }

    getBitcoinAddress() {
        if (!this.bitcoinConnector) {
            throw new Error('Bitcoin connector not initialized');
        }
        return this.bitcoinConnector.getAddress();
    }
}

module.exports = { FusionPlusBitcoin, ExtendedNetworkEnum }; 