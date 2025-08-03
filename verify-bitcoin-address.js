const bitcoin = require('bitcoinjs-lib');
const axios = require('axios');

const ADDRESS = 'mpjCmhYqwCDK2Vp5WHrxtJEaaZJmduG6iH';

async function verifyBitcoinAddress() {
    console.log('🔍 VERIFYING BITCOIN TESTNET ADDRESS');
    console.log('=====================================');
    console.log(`📍 Address: ${ADDRESS}`);
    
    // Check if it's a valid testnet address
    try {
        const script = bitcoin.address.toOutputScript(ADDRESS, bitcoin.networks.testnet);
        console.log('✅ Address is valid for Bitcoin testnet');
        console.log(`📍 Script: ${script.toString('hex')}`);
    } catch (error) {
        console.log('❌ Address is NOT valid for Bitcoin testnet:', error.message);
        return false;
    }
    
    // Check if it's a valid mainnet address (should fail)
    try {
        bitcoin.address.toOutputScript(ADDRESS, bitcoin.networks.bitcoin);
        console.log('⚠️  Address is also valid for mainnet (unexpected)');
    } catch (error) {
        console.log('✅ Address correctly fails for mainnet (expected)');
    }
    
    // Check balance on testnet
    try {
        console.log('\n🔍 Checking balance on testnet...');
        const response = await axios.get(`https://blockstream.info/testnet/api/address/${ADDRESS}`);
        console.log('✅ Address is accessible on testnet');
        console.log('📋 Address info:', response.data);
        
        const balance = response.data.chain_stats.funded_txo_sum - response.data.chain_stats.spent_txo_sum;
        console.log(`💰 Balance: ${balance} satoshis (${balance / 100000000} BTC)`);
        
        return true;
    } catch (error) {
        console.log('❌ Error checking balance:', error.message);
        return false;
    }
}

// Generate a new address to compare
function generateNewAddress() {
    console.log('\n🔄 GENERATING NEW TESTNET ADDRESS');
    console.log('==================================');
    
    const bitcoin = require('bitcoinjs-lib');
    const { ECPairFactory } = require('ecpair');
    const ecc = require('tiny-secp256k1');
    
    const ECPair = ECPairFactory(ecc);
    
    // Generate a new key pair
    const keyPair = ECPair.makeRandom({ network: bitcoin.networks.testnet });
    const { address } = bitcoin.payments.p2pkh({
        pubkey: keyPair.publicKey,
        network: bitcoin.networks.testnet
    });
    
    console.log(`📍 New Private Key: ${keyPair.privateKey.toString('hex')}`);
    console.log(`📍 New Address: ${address}`);
    
    return { address, privateKey: keyPair.privateKey.toString('hex') };
}

async function main() {
    console.log('🏆 BITCOIN ADDRESS VERIFICATION 🏆');
    console.log('==================================');
    
    const isValid = await verifyBitcoinAddress();
    
    if (!isValid) {
        console.log('\n🔄 Generating new address...');
        const newAddress = generateNewAddress();
        
        console.log('\n📋 NEW ADDRESS FOR .env FILE:');
        console.log(`BITCOIN_PRIVATE_KEY=${newAddress.privateKey}`);
        console.log(`BITCOIN_ADDRESS=${newAddress.address}`);
    }
}

if (require.main === module) {
    main().catch(console.error);
} 