const bitcoin = require('bitcoinjs-lib');
const { ECPairFactory } = require('ecpair');
const ecc = require('tiny-secp256k1');

const ECPair = ECPairFactory(ecc);

function generateProperBitcoinAddress(privateKey) {
    try {
        // Create key pair from private key
        const keyPair = ECPair.fromPrivateKey(Buffer.from(privateKey, 'hex'));
        
        // Generate P2PKH address for testnet
        const { address } = bitcoin.payments.p2pkh({
            pubkey: keyPair.publicKey,
            network: bitcoin.networks.testnet
        });
        
        console.log('🔗 Proper Bitcoin Testnet Address Generated');
        console.log('==========================================');
        console.log(`📍 Private Key: ${privateKey}`);
        console.log(`📍 Public Key: ${keyPair.publicKey.toString('hex')}`);
        console.log(`📍 Address: ${address}`);
        console.log(`🌐 Network: testnet`);
        
        // Validate the address
        try {
            bitcoin.address.toOutputScript(address, bitcoin.networks.testnet);
            console.log('✅ Address is valid for Bitcoin testnet!');
        } catch (error) {
            console.log('❌ Address validation failed:', error.message);
        }
        
        return address;
    } catch (error) {
        console.error('❌ Error generating address:', error.message);
        return null;
    }
}

// Test with the current private key
const currentPrivateKey = 'b8fe1286899fa5f9980e537d53c324fa8fc490fc44719f6a4263d008004d792b';
const properAddress = generateProperBitcoinAddress(currentPrivateKey);

console.log('\n📋 UPDATE YOUR .env FILE:');
console.log(`BITCOIN_ADDRESS=${properAddress}`);

module.exports = { generateProperBitcoinAddress }; 