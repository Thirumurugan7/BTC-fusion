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

// REAL Configuration for Hackathon
const config = {
    devPortalApiKey: process.env.DEV_PORTAL_KEY,
    walletKey: process.env.WALLET_KEY,
    walletAddress: process.env.WALLET_ADDRESS,
    rpcUrl: process.env.RPC_URL,
    bitcoinPrivateKey: process.env.BITCOIN_PRIVATE_KEY
};

// Initialize REAL Fusion+ Bitcoin (no mock)
let fusionPlus;
let web3Instance;
let blockchainProvider;

try {
    // Create REAL Web3 instance
    web3Instance = new Web3(config.rpcUrl);
    blockchainProvider = new PrivateKeyProviderConnector(config.walletKey, web3Instance);
    
    fusionPlus = new FusionPlusBitcoin({
        ...config,
        blockchainProvider
    });
    
    console.log('✅ REAL Fusion+ Bitcoin initialized for HACKATHON!');
    console.log('🚀 Ready for ACTUAL on-chain transactions!');
} catch (error) {
    console.error('❌ Error initializing real integration:', error.message);
    console.log('⚠️  Please check your environment variables');
    process.exit(1);
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
            // For EVM chains, get real balance
            const balance = await web3Instance.eth.getBalance(config.walletAddress);
            res.json({ 
                confirmed: balance, 
                unconfirmed: 0 
            });
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
        
        console.log('🚀 PLACING REAL ORDER FOR HACKATHON!');
        console.log('📋 Order Details:', { quote, hashLock });
        
        const orderResponse = await fusionPlus.placeOrder(quote, {
            walletAddress: config.walletAddress,
            hashLock,
            secretHashes
        });
        
        console.log('✅ REAL ORDER PLACED:', orderResponse);
        res.json(orderResponse);
    } catch (error) {
        console.error('❌ Order placement failed:', error);
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
        console.log('🔐 SUBMITTING REAL SECRET FOR HACKATHON!');
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
    console.log('🏆 HACKATHON SERVER RUNNING!');
    console.log(`🚀 Server: http://localhost:${PORT}`);
    console.log(`📱 Web UI: http://localhost:${PORT}`);
    console.log(`🔗 API: http://localhost:${PORT}/api/*`);
    console.log(`💰 Bitcoin: ${fusionPlus.getBitcoinAddress()}`);
    
    console.log('\n🎯 HACKATHON DEMO FEATURES:');
    console.log('   ✅ REAL Bitcoin testnet transactions');
    console.log('   ✅ ACTUAL HTLC implementation');
    console.log('   ✅ REAL bidirectional swaps');
    console.log('   ✅ REAL hashlock & timelock');
    console.log('   ✅ REAL on-chain execution');
    console.log('   ✅ NOVEL Fusion+ extension');
    console.log('   ✅ MODERN web UI');
    
    console.log('\n🏆 YOU\'RE GOING TO WIN THIS HACKATHON! 🏆');
});

module.exports = app; 