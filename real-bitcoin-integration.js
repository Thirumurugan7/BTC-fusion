const bitcoin = require('bitcoinjs-lib');
const { ECPairFactory } = require('ecpair');
const ecc = require('tiny-secp256k1');
const axios = require('axios');
const crypto = require('crypto'); // Use built-in crypto module

const ECPair = ECPairFactory(ecc);

class RealBitcoinIntegration {
    constructor(privateKey, network = 'testnet') {
        this.network = bitcoin.networks[network];
        this.keyPair = ECPair.fromPrivateKey(Buffer.from(privateKey, 'hex'));
        this.address = bitcoin.payments.p2pkh({ 
            pubkey: this.keyPair.publicKey, 
            network: this.network 
        }).address;
        
        console.log(`🔗 Real Bitcoin Integration initialized`);
        console.log(`📍 Address: ${this.address}`);
        console.log(`🌐 Network: ${network}`);
    }

    async getRealBalance() {
        try {
            const response = await axios.get(`https://blockstream.info/testnet/api/address/${this.address}`);
            const balance = response.data.chain_stats.funded_txo_sum - response.data.chain_stats.spent_txo_sum;
            return {
                confirmed: balance / 100000000, // Convert satoshis to BTC
                unconfirmed: 0,
                address: this.address
            };
        } catch (error) {
            console.error('Error getting real balance:', error.message);
            return { confirmed: 0, unconfirmed: 0, address: this.address };
        }
    }

    async getUTXOs() {
        try {
            const response = await axios.get(`https://blockstream.info/testnet/api/address/${this.address}/utxo`);
            return response.data;
        } catch (error) {
            console.error('Error getting UTXOs:', error.message);
            return [];
        }
    }

    async getTransactionHex(txid) {
        try {
            const response = await axios.get(`https://blockstream.info/testnet/api/tx/${txid}/hex`);
            return response.data;
        } catch (error) {
            console.error('Error getting transaction hex:', error.message);
            throw error;
        }
    }

    async createRealHtlcTransaction(amount, hashLock, timelock) {
        try {
            console.log('🚀 Creating REAL HTLC transaction...');
            
            // Get real UTXOs
            const utxos = await this.getUTXOs();
            if (utxos.length === 0) {
                throw new Error('No UTXOs available for transaction');
            }

            console.log(`📦 Found ${utxos.length} UTXOs`);

            // Create transaction using the new API
            const psbt = new bitcoin.Psbt({ network: this.network });
            
            // Add inputs from UTXOs
            let totalInput = 0;
            for (const utxo of utxos) {
                try {
                    // Get the full transaction hex for this UTXO
                    const txHex = await this.getTransactionHex(utxo.txid);
                    const tx = bitcoin.Transaction.fromHex(txHex);
                    
                    psbt.addInput({
                        hash: utxo.txid,
                        index: utxo.vout,
                        nonWitnessUtxo: tx.toBuffer()
                    });
                    totalInput += utxo.value;
                    console.log(`➕ Added input: ${utxo.txid}:${utxo.vout} (${utxo.value} sats)`);
                } catch (error) {
                    console.log(`⚠️ Skipping UTXO ${utxo.txid}:${utxo.vout} due to error:`, error.message);
                    continue;
                }
            }

            if (totalInput === 0) {
                throw new Error('No valid UTXOs could be added to transaction');
            }

            // Create HTLC script
            const htlcScript = this.createHtlcScript(hashLock, timelock);
            const htlcAddress = bitcoin.payments.p2sh({ 
                redeem: { output: htlcScript }, 
                network: this.network 
            }).address;

            console.log(`🎯 HTLC Address: ${htlcAddress}`);

            // Add output to HTLC address
            psbt.addOutput({
                address: htlcAddress,
                value: amount
            });

            // Add change output if needed
            const fee = 1000; // 1000 satoshis fee
            const change = totalInput - amount - fee;
            if (change > 546) { // Dust limit
                psbt.addOutput({
                    address: this.address,
                    value: change
                });
                console.log(`💰 Change output: ${change} sats to ${this.address}`);
            }

            console.log(`📊 Transaction summary:`);
            console.log(`   Inputs: ${totalInput} sats`);
            console.log(`   HTLC Output: ${amount} sats`);
            console.log(`   Fee: ${fee} sats`);
            console.log(`   Change: ${change} sats`);

            // Sign inputs
            for (let i = 0; i < psbt.data.inputs.length; i++) {
                psbt.signInput(i, this.keyPair);
                console.log(`✍️ Signed input ${i}`);
            }

            // Finalize and extract transaction
            psbt.finalizeAllInputs();
            const tx = psbt.extractTransaction();
            const txHex = tx.toHex();
            
            console.log('✅ REAL HTLC transaction created successfully!');
            console.log(`📝 Transaction hex: ${txHex.substring(0, 64)}...`);
            return txHex;
            
        } catch (error) {
            console.error('❌ Error creating real HTLC transaction:', error.message);
            throw error;
        }
    }

    createHtlcScript(hashLock, timelock) {
        // Real HTLC script: OP_HASH160 <hashlock> OP_EQUAL OP_IF <recipient_pubkey> OP_CHECKSIG OP_ELSE <timelock> OP_CHECKLOCKTIMEVERIFY OP_DROP <sender_pubkey> OP_CHECKSIG OP_ENDIF
        const recipientPubkey = this.keyPair.publicKey;
        const senderPubkey = this.keyPair.publicKey; // For demo, using same key
        
        const script = bitcoin.script.compile([
            bitcoin.opcodes.OP_HASH160,
            Buffer.from(hashLock.substring(2), 'hex'), // Remove 0x prefix
            bitcoin.opcodes.OP_EQUAL,
            bitcoin.opcodes.OP_IF,
            recipientPubkey,
            bitcoin.opcodes.OP_CHECKSIG,
            bitcoin.opcodes.OP_ELSE,
            bitcoin.script.number.encode(timelock),
            bitcoin.opcodes.OP_CHECKLOCKTIMEVERIFY,
            bitcoin.opcodes.OP_DROP,
            senderPubkey,
            bitcoin.opcodes.OP_CHECKSIG,
            bitcoin.opcodes.OP_ENDIF
        ]);
        
        return script;
    }

    async broadcastRealTransaction(txHex) {
        try {
            console.log('📡 Broadcasting REAL transaction to Bitcoin testnet...');
            
            // Broadcast to multiple services for reliability
            const broadcastUrls = [
                'https://blockstream.info/testnet/api/tx',
                'https://testnet-api.bitcoin.com/v2/rawtransactions/sendRawTransaction'
            ];

            for (const url of broadcastUrls) {
                try {
                    const response = await axios.post(url, txHex, {
                        headers: { 'Content-Type': 'text/plain' }
                    });
                    
                    const txid = response.data;
                    console.log('✅ Transaction broadcasted successfully!');
                    console.log(`🔗 TXID: ${txid}`);
                    console.log(`🌐 Explorer: https://blockstream.info/testnet/tx/${txid}`);
                    
                    return txid;
                } catch (error) {
                    console.log(`⚠️ Failed to broadcast to ${url}:`, error.message);
                    continue;
                }
            }
            
            throw new Error('Failed to broadcast to any service');
            
        } catch (error) {
            console.error('❌ Error broadcasting transaction:', error.message);
            throw error;
        }
    }

    async spendHtlcWithSecret(txid, secret, recipientAddress) {
        try {
            console.log('🔐 Spending HTLC with secret...');
            
            // Get the HTLC transaction
            const txResponse = await axios.get(`https://blockstream.info/testnet/api/tx/${txid}`);
            const htlcTx = bitcoin.Transaction.fromHex(txResponse.data.hex);
            
            // Create spending transaction using new API
            const psbt = new bitcoin.Psbt({ network: this.network });
            
            // Add HTLC output as input
            psbt.addInput({
                hash: txid,
                index: 0, // Assuming HTLC is first output
                nonWitnessUtxo: htlcTx.toBuffer()
            });
            
            // Add output to recipient
            psbt.addOutput({
                address: recipientAddress,
                value: htlcTx.outs[0].value - 1000 // Subtract fee
            });
            
            // Create witness for HTLC spending
            const htlcScript = this.createHtlcScript('0x' + crypto.createHash('sha256').update(secret.substring(2), 'hex').digest('hex'), Math.floor(Date.now() / 1000) + 3600);
            const htlcRedeem = bitcoin.payments.p2sh({
                redeem: { 
                    input: bitcoin.script.compile([Buffer.from(secret.substring(2), 'hex')]),
                    output: htlcScript 
                },
                network: this.network
            });
            
            psbt.signInput(0, this.keyPair, htlcRedeem.redeem);
            
            // Finalize and extract transaction
            psbt.finalizeAllInputs();
            const spendTx = psbt.extractTransaction();
            const spendTxHex = spendTx.toHex();
            
            // Broadcast spending transaction
            const spendTxid = await this.broadcastRealTransaction(spendTxHex);
            
            console.log('✅ HTLC spent successfully!');
            console.log(`🔗 Spend TXID: ${spendTxid}`);
            
            return spendTxid;
            
        } catch (error) {
            console.error('❌ Error spending HTLC:', error.message);
            throw error;
        }
    }

    getAddress() {
        return this.address;
    }
}

module.exports = RealBitcoinIntegration; 