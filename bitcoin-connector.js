const bitcoin = require('bitcoinjs-lib');
const axios = require('axios');
const { BIP32Factory } = require('bip32');
const ecc = require('tiny-secp256k1');
const bip32 = BIP32Factory(ecc);

class BitcoinConnector {
    constructor(privateKey, network = 'testnet') {
        this.network = network === 'testnet' ? bitcoin.networks.testnet : bitcoin.networks.bitcoin;
        this.privateKey = privateKey;
        this.keyPair = bitcoin.ECPair.fromPrivateKey(Buffer.from(privateKey, 'hex'), { network: this.network });
        this.address = bitcoin.payments.p2pkh({ pubkey: this.keyPair.publicKey, network: this.network }).address;
        
        // Bitcoin testnet RPC endpoints (you can replace with your own)
        this.rpcUrl = network === 'testnet' 
            ? 'https://blockstream.info/testnet/api' 
            : 'https://blockstream.info/api';
    }

    async getBalance() {
        try {
            const response = await axios.get(`${this.rpcUrl}/address/${this.address}`);
            return {
                confirmed: response.data.chain_stats.funded_txo_sum - response.data.chain_stats.spent_txo_sum,
                unconfirmed: response.data.mempool_stats.funded_txo_sum - response.data.mempool_stats.spent_txo_sum
            };
        } catch (error) {
            throw new Error(`Failed to get balance: ${error.message}`);
        }
    }

    async getUtxos() {
        try {
            const response = await axios.get(`${this.rpcUrl}/address/${this.address}/utxo`);
            return response.data.map(utxo => ({
                txid: utxo.txid,
                vout: utxo.vout,
                value: utxo.value,
                script: utxo.script
            }));
        } catch (error) {
            throw new Error(`Failed to get UTXOs: ${error.message}`);
        }
    }

    async createHtlcTransaction(recipientAddress, amount, hashlock, timelock) {
        try {
            const utxos = await this.getUtxos();
            const totalBalance = utxos.reduce((sum, utxo) => sum + utxo.value, 0);
            
            if (totalBalance < amount) {
                throw new Error('Insufficient balance');
            }

            // Create HTLC script
            const htlcScript = this.createHtlcScript(hashlock, timelock, this.address, recipientAddress);
            
            // Build transaction
            const psbt = new bitcoin.Psbt({ network: this.network });
            
            // Add inputs
            let inputAmount = 0;
            for (const utxo of utxos) {
                if (inputAmount >= amount + 1000) break; // Add fee buffer
                
                const txHex = await this.getTransactionHex(utxo.txid);
                psbt.addInput({
                    hash: utxo.txid,
                    index: utxo.vout,
                    nonWitnessUtxo: Buffer.from(txHex, 'hex')
                });
                inputAmount += utxo.value;
            }

            // Add HTLC output
            psbt.addOutput({
                address: bitcoin.address.fromOutputScript(htlcScript, this.network),
                value: amount
            });

            // Add change output if needed
            const fee = 1000; // Estimated fee
            const change = inputAmount - amount - fee;
            if (change > 546) { // Dust threshold
                psbt.addOutput({
                    address: this.address,
                    value: change
                });
            }

            // Sign transaction
            psbt.signAllInputs(this.keyPair);
            psbt.finalizeAllInputs();

            return psbt.extractTransaction().toHex();
        } catch (error) {
            throw new Error(`Failed to create HTLC transaction: ${error.message}`);
        }
    }

    createHtlcScript(hashlock, timelock, senderAddress, recipientAddress) {
        // HTLC script: OP_HASH160 <hashlock> OP_EQUAL OP_IF <recipient_pubkey> OP_CHECKSIG OP_ELSE <timelock> OP_CHECKLOCKTIMEVERIFY OP_DROP <sender_pubkey> OP_CHECKSIG OP_ENDIF
        const senderPubkey = this.keyPair.publicKey;
        const recipientPubkey = bitcoin.ECPair.fromPrivateKey(Buffer.from('0000000000000000000000000000000000000000000000000000000000000001', 'hex')).publicKey; // Placeholder

        const script = bitcoin.script.compile([
            bitcoin.opcodes.OP_HASH160,
            hashlock,
            bitcoin.opcodes.OP_EQUAL,
            bitcoin.opcodes.OP_IF,
            recipientPubkey,
            bitcoin.opcodes.OP_CHECKSIG,
            bitcoin.opcodes.OP_ELSE,
            timelock,
            bitcoin.opcodes.OP_CHECKLOCKTIMEVERIFY,
            bitcoin.opcodes.OP_DROP,
            senderPubkey,
            bitcoin.opcodes.OP_CHECKSIG,
            bitcoin.opcodes.OP_ENDIF
        ]);

        return script;
    }

    async getTransactionHex(txid) {
        try {
            const response = await axios.get(`${this.rpcUrl}/tx/${txid}/hex`);
            return response.data;
        } catch (error) {
            throw new Error(`Failed to get transaction hex: ${error.message}`);
        }
    }

    async broadcastTransaction(txHex) {
        try {
            const response = await axios.post(`${this.rpcUrl}/tx`, txHex, {
                headers: { 'Content-Type': 'text/plain' }
            });
            return response.data;
        } catch (error) {
            throw new Error(`Failed to broadcast transaction: ${error.message}`);
        }
    }

    async spendHtlc(htlcTxid, secret, recipientAddress) {
        try {
            // Get HTLC transaction details
            const txHex = await this.getTransactionHex(htlcTxid);
            const tx = bitcoin.Transaction.fromHex(txHex);
            
            // Create spending transaction
            const psbt = new bitcoin.Psbt({ network: this.network });
            
            // Add HTLC input
            psbt.addInput({
                hash: htlcTxid,
                index: 0, // Assuming HTLC is first output
                nonWitnessUtxo: Buffer.from(txHex, 'hex'),
                redeemScript: this.createHtlcScript(secret, 0, this.address, recipientAddress)
            });

            // Add output to recipient
            psbt.addOutput({
                address: recipientAddress,
                value: tx.outs[0].value - 1000 // Subtract fee
            });

            // Sign with secret
            psbt.signAllInputs(this.keyPair);
            psbt.finalizeAllInputs();

            const spendingTx = psbt.extractTransaction();
            return await this.broadcastTransaction(spendingTx.toHex());
        } catch (error) {
            throw new Error(`Failed to spend HTLC: ${error.message}`);
        }
    }

    // Interface compatibility methods
    async signTransaction(txData) {
        // Implement signing for compatibility with Fusion+ SDK
        return this.keyPair.sign(txData);
    }

    async sendTransaction(txData) {
        // Implement transaction sending for compatibility with Fusion+ SDK
        return await this.broadcastTransaction(txData);
    }

    getAddress() {
        return this.address;
    }

    getPublicKey() {
        return this.keyPair.publicKey.toString('hex');
    }
}

module.exports = BitcoinConnector; 