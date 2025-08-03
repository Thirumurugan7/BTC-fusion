const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001; // Use different port to avoid conflicts

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get('/api/test', (req, res) => {
    res.json({ 
        message: 'Server is working!',
        timestamp: new Date().toISOString(),
        status: 'success'
    });
});

// Chains route
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

app.listen(PORT, () => {
    console.log(`✅ Test server running on http://localhost:${PORT}`);
    console.log(`✅ Test API endpoint: http://localhost:${PORT}/api/test`);
    console.log(`✅ Chains API endpoint: http://localhost:${PORT}/api/chains`);
});

module.exports = app; 