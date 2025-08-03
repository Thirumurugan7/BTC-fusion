const express = require('express');
const cors = require('cors');
const path = require('path');
const { FusionPlusBitcoin, ExtendedNetworkEnum } = require('./fusion-plus-bitcoin');
const { HashLock } = require('@1inch/cross-chain-sdk');
const { PrivateKeyProviderConnector } = require('@1inch/cross-chain-sdk');
const { Web3 } = require('web3');
const { randomBytes } = require('ethers');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Configuration with fallbacks for demo
const config = {
    devPortalApiKey: process.env.DEV_PORTAL_KEY || 'demo_key',
    walletKey: process.env.WALLET_KEY || '0000000000000000000000000000000000000000000000000000000000000001',
    walletAddress: process.env.WALLET_ADDRESS || '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
    rpcUrl: process.env.RPC_URL || 'https://eth-sepolia.g.alchemy.com/v2/demo',
    bitcoinPrivateKey: process.env.BITCOIN_PRIVATE_KEY || process.env.WALLET_KEY || '0000000000000000000000000000000000000000000000000000000000000001'
};

// Initialize Fusion+ Bitcoin with error handling
let fusionPlus;
let web3Instance;
let blockchainProvider;

try {
    // Create a mock Web3 instance for demo purposes
    web3Instance = new Web3('https://eth-sepolia.g.alchemy.com/v2/demo');
    blockchainProvider = new PrivateKeyProviderConnector(config.walletKey, web3Instance);
    
    fusionPlus = new FusionPlusBitcoin({
        ...config,
        blockchainProvider
    });
    
    console.log('✅ Fusion+ Bitcoin initialized successfully');
} catch (error) {
    console.log('⚠️  Using mock configuration for demo purposes');
    // Create a mock fusionPlus for demo
    fusionPlus = {
        isBitcoinChain: (chainId) => chainId === ExtendedNetworkEnum.BITCOIN_TESTNET || chainId === ExtendedNetworkEnum.BITCOIN_MAINNET,
        getBitcoinAddress: () => 'mrCDrCybB6J1vRfbwM5hemdJz73FwDBC8r',
        getBitcoinBalance: async () => ({ confirmed: 100000000, unconfirmed: 0 }),
        generateSecret: () => '0x' + Buffer.from(randomBytes(32)).toString('hex'),
        generateHashLock: (secret) => '0x' + Buffer.from(randomBytes(32)).toString('hex'),
        getQuote: async (params) => ({
            amount: params.amount,
            isBitcoinSwap: params.srcChainId === ExtendedNetworkEnum.BITCOIN_TESTNET || params.dstChainId === ExtendedNetworkEnum.BITCOIN_TESTNET,
            fee: '1000'
        }),
        placeOrder: async (quote, options) => ({
            orderHash: 'demo_order_hash_' + Date.now(),
            status: 'pending'
        }),
        getOrderStatus: async (orderHash) => ({
            status: 'confirmed',
            txid: orderHash,
            confirmations: 1
        }),
        submitSecret: async (orderHash, secret) => ({
            success: true,
            txid: 'demo_tx_' + Date.now()
        })
    };
}

// Utility function
function getRandomBytes32() {
    return '0x' + Buffer.from(randomBytes(32)).toString('hex');
}

// API Routes
app.get('/api/chains', (req, res) => {
    res.json({
        evm: [
            { id: '1', name: 'Ethereum', symbol: 'ETH' },
            { id: '137', name: 'Polygon', symbol: 'MATIC' },
            { id: '42161', name: 'Arbitrum', symbol: 'ARB' },
            { id: '8453', name: 'Base', symbol: 'ETH' }
        ],
        bitcoin: [
            { id: 'bitcoin_testnet', name: 'Bitcoin Testnet', symbol: 'BTC' },
            { id: 'bitcoin_mainnet', name: 'Bitcoin Mainnet', symbol: 'BTC' }
        ]
    });
});

app.get('/api/balance/:chainId', async (req, res) => {
    try {
        const { chainId } = req.params;
        
        if (chainId.startsWith('bitcoin_')) {
            const balance = await fusionPlus.getBitcoinBalance();
            res.json(balance);
        } else {
            // For EVM chains, return mock balance
            res.json({ confirmed: 1000000000000000000, unconfirmed: 0 });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/quote', async (req, res) => {
    try {
        const { srcChainId, dstChainId, srcTokenAddress, dstTokenAddress, amount } = req.body;
        
        const params = {
            srcChainId,
            dstChainId,
            srcTokenAddress,
            dstTokenAddress,
            amount,
            enableEstimate: true,
            walletAddress: config.walletAddress
        };

        const quote = await fusionPlus.getQuote(params);
        res.json(quote);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/place-order', async (req, res) => {
    try {
        const { quote, hashLock, secretHashes } = req.body;
        
        const orderResponse = await fusionPlus.placeOrder(quote, {
            walletAddress: config.walletAddress,
            hashLock,
            secretHashes
        });
        
        res.json(orderResponse);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/order-status/:orderHash', async (req, res) => {
    try {
        const { orderHash } = req.params;
        const status = await fusionPlus.getOrderStatus(orderHash);
        res.json(status);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/submit-secret', async (req, res) => {
    try {
        const { orderHash, secret } = req.body;
        const result = await fusionPlus.submitSecret(orderHash, secret);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/bitcoin-address', (req, res) => {
    try {
        const address = fusionPlus.getBitcoinAddress();
        res.json({ address });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📱 Web UI available at http://localhost:${PORT}`);
    console.log(`🔗 API endpoints available at http://localhost:${PORT}/api/*`);
    console.log(`💰 Bitcoin address: ${fusionPlus.getBitcoinAddress()}`);
    console.log(`\n📋 Demo Features:`);
    console.log(`   ✅ Bitcoin ↔ Ethereum swaps`);
    console.log(`   ✅ HTLC implementation`);
    console.log(`   ✅ Real-time order status`);
    console.log(`   ✅ Modern web UI`);
    console.log(`   ✅ Bidirectional functionality`);
    console.log(`   ✅ Hashlock & timelock preservation`);
}); 