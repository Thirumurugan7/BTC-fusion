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

// Configuration
const config = {
    devPortalApiKey: process.env.DEV_PORTAL_KEY,
    walletKey: process.env.WALLET_KEY,
    walletAddress: process.env.WALLET_ADDRESS,
    rpcUrl: process.env.RPC_URL,
    bitcoinPrivateKey: process.env.BITCOIN_PRIVATE_KEY || process.env.WALLET_KEY
};

// Initialize Fusion+ Bitcoin
const web3Instance = new Web3(config.rpcUrl);
const blockchainProvider = new PrivateKeyProviderConnector(config.walletKey, web3Instance);

const fusionPlus = new FusionPlusBitcoin({
    ...config,
    blockchainProvider
});

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
            // For EVM chains, you would implement balance checking
            res.json({ confirmed: 0, unconfirmed: 0 });
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
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Bitcoin address: ${fusionPlus.getBitcoinAddress()}`);
}); 