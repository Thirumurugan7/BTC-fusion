const axios = require('axios');
const bitcoin = require('bitcoinjs-lib');
const { ECPairFactory } = require('ecpair');
const ecc = require('tiny-secp256k1');

const ECPair = ECPairFactory(ecc);

class TestnetBTCFaucet {
    constructor(privateKey) {
        this.network = bitcoin.networks.testnet;
        this.keyPair = ECPair.fromPrivateKey(Buffer.from(privateKey, 'hex'));
        this.address = bitcoin.payments.p2pkh({ 
            pubkey: this.keyPair.publicKey, 
            network: this.network 
        }).address;
        
        console.log(`🔗 Bitcoin Testnet Faucet initialized`);
        console.log(`📍 Address: ${this.address}`);
    }

    async getBalance() {
        try {
            const response = await axios.get(`https://blockstream.info/testnet/api/address/${this.address}`);
            const balance = response.data.chain_stats.funded_txo_sum - response.data.chain_stats.spent_txo_sum;
            return balance / 100000000; // Convert satoshis to BTC
        } catch (error) {
            console.error('Error getting balance:', error.message);
            return 0;
        }
    }

    async requestFromFaucet1() {
        // Coinfaucet.io
        try {
            console.log('🚰 Requesting from Coinfaucet.io...');
            const response = await axios.post('https://coinfaucet.io/en/btc-testnet/', {
                address: this.address
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
                }
            });
            console.log('✅ Request sent to Coinfaucet.io');
            return true;
        } catch (error) {
            console.log('❌ Coinfaucet.io failed:', error.message);
            return false;
        }
    }

    async requestFromFaucet2() {
        // Testnet.help
        try {
            console.log('🚰 Requesting from Testnet.help...');
            const response = await axios.post('https://testnet.help/en/bitcoinfaucet', {
                address: this.address,
                amount: '0.001'
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
                }
            });
            console.log('✅ Request sent to Testnet.help');
            return true;
        } catch (error) {
            console.log('❌ Testnet.help failed:', error.message);
            return false;
        }
    }

    async requestFromFaucet3() {
        // BlockCypher faucet
        try {
            console.log('🚰 Requesting from BlockCypher...');
            const response = await axios.post('https://api.blockcypher.com/v1/btc/test3/faucet', {
                address: this.address,
                amount: 100000 // 0.001 BTC in satoshis
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            console.log('✅ Request sent to BlockCypher');
            return true;
        } catch (error) {
            console.log('❌ BlockCypher failed:', error.message);
            return false;
        }
    }

    async requestFromFaucet4() {
        // Bitcoin testnet faucet
        try {
            console.log('🚰 Requesting from Bitcoin Testnet Faucet...');
            const response = await axios.post('https://testnet-faucet.mempool.co/api/v1/faucet', {
                address: this.address,
                amount: '0.001'
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            console.log('✅ Request sent to Bitcoin Testnet Faucet');
            return true;
        } catch (error) {
            console.log('❌ Bitcoin Testnet Faucet failed:', error.message);
            return false;
        }
    }

    async getAllFaucets() {
        console.log('\n🏆 REQUESTING TESTNET BTC FROM ALL FAUCETS! 🏆');
        console.log(`📍 Your address: ${this.address}`);
        
        const initialBalance = await this.getBalance();
        console.log(`💰 Current balance: ${initialBalance} BTC`);
        
        if (initialBalance > 0) {
            console.log('✅ You already have testnet BTC!');
            return true;
        }

        console.log('\n🚰 Requesting from multiple faucets...');
        
        const results = await Promise.allSettled([
            this.requestFromFaucet1(),
            this.requestFromFaucet2(),
            this.requestFromFaucet3(),
            this.requestFromFaucet4()
        ]);

        console.log('\n⏳ Waiting 30 seconds for transactions to arrive...');
        await new Promise(resolve => setTimeout(resolve, 30000));

        const finalBalance = await this.getBalance();
        console.log(`💰 Final balance: ${finalBalance} BTC`);

        if (finalBalance > initialBalance) {
            console.log('🎉 SUCCESS! You received testnet BTC!');
            return true;
        } else {
            console.log('❌ No BTC received. Trying manual faucets...');
            return false;
        }
    }

    getManualFaucetInstructions() {
        console.log('\n📋 MANUAL FAUCET INSTRUCTIONS:');
        console.log('1. Go to: https://coinfaucet.io/en/btc-testnet/');
        console.log('2. Enter your address:', this.address);
        console.log('3. Click "Get Testnet Bitcoin"');
        console.log('4. Wait for confirmation');
        console.log('\nAlternative faucets:');
        console.log('- https://testnet.help/en/bitcoinfaucet');
        console.log('- https://blockstream.info/testnet/');
        console.log('- https://testnet-faucet.mempool.co/');
    }
}

// Main execution
async function main() {
    require('dotenv').config();
    
    const privateKey = process.env.BITCOIN_PRIVATE_KEY || 'b8fe1286899fa5f9980e537d53c324fa8fc490fc44719f6a4263d008004d792b';
    
    const faucet = new TestnetBTCFaucet(privateKey);
    
    console.log('🏆 AUTOMATIC TESTNET BTC ACQUISITION 🏆');
    console.log('==========================================');
    
    const success = await faucet.getAllFaucets();
    
    if (!success) {
        faucet.getManualFaucetInstructions();
    }
    
    console.log('\n🎯 NEXT STEPS:');
    console.log('1. Check your balance: node get-testnet-btc.js');
    console.log('2. Run real server: node real-working-server.js');
    console.log('3. Test real transactions!');
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = TestnetBTCFaucet; 