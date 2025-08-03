const express = require('express');
const path = require('path');
const crypto = require('crypto');
const { Web3 } = require('web3');
const RealBitcoinIntegration = require('../real-bitcoin-integration');
require('dotenv').config();
const { HashLock } = require('@1inch/cross-chain-sdk');
const { PrivateKeyProviderConnector } = require('@1inch/cross-chain-sdk');

const app = express();

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Initialize Bitcoin integration
const bitcoinIntegration = new RealBitcoinIntegration();

// Initialize Web3 for Ethereum
let web3;
try {
    web3 = new Web3(process.env.RPC_URL || 'https://eth-sepolia.g.alchemy.com/v2/demo');
} catch (error) {
    console.log('Web3 initialization failed, using fallback');
    web3 = null;
}

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.get('/api/balance/bitcoin_testnet', async (req, res) => {
    try {
        const balance = await bitcoinIntegration.getRealBalance();
        res.json(balance);
    } catch (error) {
        console.error('Error getting Bitcoin balance:', error);
        res.status(500).json({ error: 'Failed to get Bitcoin balance' });
    }
});

app.get('/api/balance/:chainId', async (req, res) => {
    try {
        if (!web3) {
            return res.json({ confirmed: 0, unconfirmed: 0 });
        }
        
        const address = process.env.WALLET_ADDRESS;
        if (!address) {
            return res.json({ confirmed: 0, unconfirmed: 0 });
        }
        
        const balance = await web3.eth.getBalance(address);
        const ethBalance = web3.utils.fromWei(balance, 'ether');
        
        res.json({ confirmed: parseFloat(ethBalance), unconfirmed: 0 });
    } catch (error) {
        console.error('Error getting Ethereum balance:', error);
        res.json({ confirmed: 0, unconfirmed: 0 });
    }
});

app.get('/api/bitcoin-address', (req, res) => {
    try {
        const address = bitcoinIntegration.getAddress();
        res.json({ address });
    } catch (error) {
        console.error('Error getting Bitcoin address:', error);
        res.status(500).json({ error: 'Failed to get Bitcoin address' });
    }
});

app.post('/api/place-order', async (req, res) => {
    try {
        console.log('🚀 PLACING REAL ORDER WITH ACTUAL BITCOIN!');
        
        const { srcChainId, dstChainId, amount } = req.body;
        
        // Generate hashlock
        const secret = '0x' + Buffer.from(crypto.randomBytes(32)).toString('hex');
        const hash = '0x' + crypto.createHash('sha256').update(secret.slice(2), 'hex').digest('hex');
        
        const quote = {
            srcChainId: srcChainId || 'bitcoin_testnet',
            dstChainId: dstChainId || '1',
            srcTokenAddress: '0x0000000000000000000000000000000000000000',
            dstTokenAddress: '0x0000000000000000000000000000000000000000',
            amount: amount || '10000',
            estimatedAmount: amount || '10000',
            fee: '1000',
            isBitcoinSwap: true
        };
        
        const hashLock = { hash, secret };
        
        console.log('📋 Order Details:', { quote, hashLock });
        
        // Create real HTLC transaction
        console.log('🔗 Creating REAL HTLC transaction on Bitcoin testnet...');
        const txid = await bitcoinIntegration.createRealHtlcTransaction(amount || 10000, hash);
        
        const orderResponse = {
            orderHash: txid,
            status: 'pending',
            htlcTxid: txid,
            hashLock,
            secretHashes: [{ hash, secret }],
            quote,
            timestamp: Date.now(),
            explorerUrl: `https://blockstream.info/testnet/tx/${txid}`,
            note: '✅ REAL Bitcoin testnet transaction with actual BTC!',
            isReal: true
        };
        
        console.log('✅ REAL ORDER PLACED ON BITCOIN TESTNET:', orderResponse);
        
        res.json(orderResponse);
    } catch (error) {
        console.error('❌ Order placement failed:', error);
        res.status(500).json({ 
            error: 'Order placement failed', 
            details: error.message 
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        message: 'Your Boy Satoshi is running!',
        timestamp: new Date().toISOString()
    });
});

// Export for Vercel
module.exports = app; 