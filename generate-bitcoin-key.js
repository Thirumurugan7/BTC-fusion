const bitcoin = require('bitcoinjs-lib');
const { ECPairFactory } = require('ecpair');
const ecc = require('tiny-secp256k1');

const ECPair = ECPairFactory(ecc);

console.log('🔑 Generating Bitcoin Testnet Key Pair...\n');

// Generate a new key pair
const keyPair = ECPair.makeRandom({ network: bitcoin.networks.testnet });

// Get the private key (WIF format for easier use)
const privateKey = keyPair.toWIF();
const privateKeyHex = keyPair.privateKey.toString('hex');

// Get the address
const address = bitcoin.payments.p2pkh({ 
    pubkey: keyPair.publicKey, 
    network: bitcoin.networks.testnet 
}).address;

console.log('✅ Bitcoin Testnet Key Generated:');
console.log('================================');
console.log(`Private Key (WIF): ${privateKey}`);
console.log(`Private Key (Hex): ${privateKeyHex}`);
console.log(`Public Address: ${address}`);
console.log(`Network: Testnet`);

console.log('\n📋 Environment Variables:');
console.log('========================');
console.log(`BITCOIN_PRIVATE_KEY=${privateKeyHex}`);
console.log(`BITCOIN_ADDRESS=${address}`);

console.log('\n💰 Next Steps:');
console.log('1. Get testnet BTC from: https://testnet-faucet.mempool.co/');
console.log('2. Send to address: ' + address);
console.log('3. Check balance at: https://blockstream.info/testnet/address/' + address);

console.log('\n⚠️  Security Note:');
console.log('- This is for TESTING only');
console.log('- Never use testnet keys for mainnet');
console.log('- Keep private keys secure');

module.exports = { keyPair, address, privateKey, privateKeyHex }; 