const axios = require('axios');
require('dotenv').config();

const BITCOIN_ADDRESS = 'mpjCmhYqwCDK2Vp5WHrxtJEaaZJmduG6iH';

async function getTestnetBTC() {
    console.log('🏆 QUICK TESTNET BTC ACQUISITION 🏆');
    console.log('=====================================');
    console.log(`📍 Your address: ${BITCOIN_ADDRESS}`);
    
    // Try BlockCypher API (most reliable)
    try {
        console.log('\n🚰 Trying BlockCypher API...');
        const response = await axios.post('https://api.blockcypher.com/v1/btc/test3/faucet', {
            address: BITCOIN_ADDRESS,
            amount: 100000 // 0.001 BTC
        }, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log('✅ SUCCESS! BlockCypher faucet request sent!');
        console.log('📋 Response:', response.data);
        
        if (response.data.tx_ref) {
            console.log(`🔗 Transaction: https://live.blockcypher.com/btc-testnet/tx/${response.data.tx_ref}/`);
        }
        
        return true;
    } catch (error) {
        console.log('❌ BlockCypher failed:', error.response?.data || error.message);
    }
    
    // Try Coinfaucet.io
    try {
        console.log('\n🚰 Trying Coinfaucet.io...');
        const response = await axios.post('https://coinfaucet.io/api/faucet', {
            address: BITCOIN_ADDRESS,
            network: 'btc-testnet'
        }, {
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
            }
        });
        
        console.log('✅ SUCCESS! Coinfaucet.io request sent!');
        console.log('📋 Response:', response.data);
        return true;
    } catch (error) {
        console.log('❌ Coinfaucet.io failed:', error.response?.data || error.message);
    }
    
    console.log('\n❌ All automatic faucets failed.');
    console.log('\n📋 MANUAL FAUCET OPTIONS:');
    console.log('1. https://coinfaucet.io/en/btc-testnet/');
    console.log('2. https://testnet.help/en/bitcoinfaucet');
    console.log('3. https://blockstream.info/testnet/');
    console.log(`4. Enter address: ${BITCOIN_ADDRESS}`);
    
    return false;
}

// Check balance
async function checkBalance() {
    try {
        const response = await axios.get(`https://blockstream.info/testnet/api/address/${BITCOIN_ADDRESS}`);
        const balance = response.data.chain_stats.funded_txo_sum - response.data.chain_stats.spent_txo_sum;
        const btcBalance = balance / 100000000;
        
        console.log(`💰 Current balance: ${btcBalance} BTC (${balance} satoshis)`);
        return btcBalance;
    } catch (error) {
        console.log('❌ Error checking balance:', error.message);
        return 0;
    }
}

async function main() {
    console.log('🔍 Checking current balance...');
    const initialBalance = await checkBalance();
    
    if (initialBalance > 0) {
        console.log('✅ You already have testnet BTC!');
        console.log('🚀 Ready to run real transactions!');
        return;
    }
    
    console.log('❌ No testnet BTC found. Getting some...');
    await getTestnetBTC();
    
    console.log('\n⏳ Waiting 30 seconds for transaction to arrive...');
    await new Promise(resolve => setTimeout(resolve, 30000));
    
    console.log('\n🔍 Checking final balance...');
    const finalBalance = await checkBalance();
    
    if (finalBalance > initialBalance) {
        console.log('🎉 SUCCESS! You received testnet BTC!');
        console.log('🚀 Now you can run: node real-working-server.js');
    } else {
        console.log('❌ No BTC received yet. Try manual faucets.');
    }
}

if (require.main === module) {
    main().catch(console.error);
} 