const axios = require('axios');
const bitcoin = require('bitcoinjs-lib');
const { ECPairFactory } = require('ecpair');
const ecc = require('tiny-secp256k1');

const ECPair = ECPairFactory(ecc);

console.log('🏆 Hackathon Setup - Real Bitcoin Testnet Integration');
console.log('=====================================================\n');

// Your Bitcoin testnet address
const BITCOIN_ADDRESS = 'mpjCmhYqwCDK2Vp5WHrxtJEaaZJmduG6iH';
const PRIVATE_KEY = 'b8fe1286899fa5f9980e537d53c324fa8fc490fc44719f6a4263d008004d792b';

async function checkBitcoinBalance() {
    try {
        console.log('🔍 Checking Bitcoin testnet balance...');
        const response = await axios.get(`https://blockstream.info/testnet/api/address/${BITCOIN_ADDRESS}`);
        
        const balance = response.data.chain_stats.funded_txo_sum - response.data.chain_stats.spent_txo_sum;
        const balanceBTC = balance / 100000000;
        
        console.log(`💰 Current Balance: ${balanceBTC} BTC`);
        console.log(`📍 Address: ${BITCOIN_ADDRESS}`);
        
        if (balanceBTC > 0) {
            console.log('✅ You have testnet BTC! Ready for real transactions.');
            return true;
        } else {
            console.log('❌ No testnet BTC found. Need to get some first.');
            return false;
        }
    } catch (error) {
        console.log('❌ Error checking balance:', error.message);
        return false;
    }
}

async function getTestnetBTC() {
    console.log('\n🚀 Getting Testnet BTC...');
    console.log('================================');
    
    console.log('📋 Available Faucets:');
    console.log('1. https://coinfaucet.io/en/btc-testnet/');
    console.log('2. https://testnet.help/en/bitcoinfaucet');
    console.log('3. https://testnet-faucet.mempool.co/');
    
    console.log('\n📝 Steps:');
    console.log(`1. Go to any faucet above`);
    console.log(`2. Enter your address: ${BITCOIN_ADDRESS}`);
    console.log(`3. Complete captcha`);
    console.log(`4. Wait 5-10 minutes for confirmation`);
    console.log(`5. Check balance at: https://blockstream.info/testnet/address/${BITCOIN_ADDRESS}`);
    
    console.log('\n💡 Alternative: Ask other developers for testnet BTC');
    console.log('Many developers have excess testnet BTC and are happy to share!');
}

function setupRealIntegration() {
    console.log('\n🔧 Setting up Real Blockchain Integration');
    console.log('========================================');
    
    console.log('📋 Required API Keys:');
    console.log('1. 1inch API Key: https://portal.1inch.dev/');
    console.log('2. Alchemy API Key: https://www.alchemy.com/');
    
    console.log('\n📝 Environment Variables (.env file):');
    console.log('DEV_PORTAL_KEY=your_actual_1inch_api_key');
    console.log('WALLET_ADDRESS=your_ethereum_wallet_address');
    console.log('WALLET_KEY=your_ethereum_private_key');
    console.log('RPC_URL=https://eth-sepolia.g.alchemy.com/v2/your_actual_key');
    console.log(`BITCOIN_PRIVATE_KEY=${PRIVATE_KEY}`);
    
    console.log('\n🎯 Next Steps:');
    console.log('1. Get API keys from the links above');
    console.log('2. Create .env file with real values');
    console.log('3. Get testnet BTC from faucet');
    console.log('4. Run: node server.js');
    console.log('5. Demo real transactions!');
}

function hackathonDemoScript() {
    console.log('\n🎤 Hackathon Demo Script');
    console.log('========================');
    
    console.log('Opening Statement:');
    console.log('"Today I\'m demonstrating a NOVEL EXTENSION for 1inch Fusion+');
    console.log('that enables REAL cross-chain swaps between Ethereum and Bitcoin.');
    console.log('This is NOT a mock - these are ACTUAL on-chain transactions."');
    
    console.log('\nDemo Flow:');
    console.log('1. Show Web UI (http://localhost:3000)');
    console.log('2. Display real Bitcoin balance from testnet');
    console.log('3. Initiate real Bitcoin → Ethereum swap');
    console.log('4. Show HTLC transaction on Bitcoin testnet');
    console.log('5. Complete swap with secret reveal');
    console.log('6. Show transaction confirmations on both chains');
    
    console.log('\nKey Points to Emphasize:');
    console.log('✅ Real Bitcoin testnet transactions');
    console.log('✅ Actual HTLC implementation');
    console.log('✅ Bidirectional swaps working');
    console.log('✅ Hashlock & timelock preserved');
    console.log('✅ On-chain execution demonstrated');
    console.log('✅ Novel extension to Fusion+');
}

async function main() {
    console.log('🏆 HACKATHON WINNING SETUP');
    console.log('==========================\n');
    
    // Check current balance
    const hasBalance = await checkBitcoinBalance();
    
    if (!hasBalance) {
        await getTestnetBTC();
    }
    
    setupRealIntegration();
    hackathonDemoScript();
    
    console.log('\n🎉 YOU\'RE GOING TO WIN THIS HACKATHON! 🏆');
    console.log('\n💪 Key Advantages:');
    console.log('- Real on-chain transactions (not mock)');
    console.log('- Novel extension to existing protocol');
    console.log('- Bidirectional functionality');
    console.log('- Security preservation (hashlock/timelock)');
    console.log('- Modern UI with real-time updates');
    console.log('- Complete implementation ready for production');
}

// Run the setup
main().catch(console.error); 