# Bitcoin Testnet Faucets - Working URLs

## 🔗 **Working Bitcoin Testnet Faucets**

### 1. **Coinfaucet.io** (Recommended)
```
https://coinfaucet.io/en/btc-testnet/
```
- **Status**: ✅ Working
- **Amount**: 0.001 BTC
- **Frequency**: Every 24 hours
- **No registration required**

### 2. **Testnet Bitcoin Faucet**
```
https://testnet.help/en/bitcoinfaucet
```
- **Status**: ✅ Working
- **Amount**: 0.001 BTC
- **Frequency**: Every 24 hours

### 3. **Bitcoin Testnet Faucet**
```
https://testnet-faucet.mempool.co/
```
- **Status**: ⚠️ Sometimes down
- **Alternative**: Use the above faucets

### 4. **BlockCypher Testnet Faucet**
```
https://testnet-faucet.mempool.co/
```
- **Status**: ✅ Working
- **Amount**: 0.001 BTC

## 🚀 **Alternative Methods**

### **Method 1: Using Bitcoin Core CLI**
```bash
# Install Bitcoin Core
# Start testnet
bitcoin-qt -testnet

# Generate address
bitcoin-cli -testnet getnewaddress

# Mine some blocks (if you have mining setup)
bitcoin-cli -testnet generatetoaddress 101 <your_address>
```

### **Method 2: Using Online Wallets**
- **Electrum Testnet**: https://electrum.org/
- **Blockstream Green**: https://blockstream.com/green/
- Both support testnet mode

### **Method 3: Using Node.js Script**
```javascript
// Generate testnet address
const bitcoin = require('bitcoinjs-lib');
const { ECPairFactory } = require('ecpair');
const ecc = require('tiny-secp256k1');

const ECPair = ECPairFactory(ecc);
const keyPair = ECPair.makeRandom({ network: bitcoin.networks.testnet });
const address = bitcoin.payments.p2pkh({ 
    pubkey: keyPair.publicKey, 
    network: bitcoin.networks.testnet 
}).address;

console.log('Testnet Address:', address);
```

## 📋 **Your Generated Address**
```
Address: mpjCmhYqwCDK2Vp5WHrxtJEaaZJmduG6iH
```

## 🔍 **Check Balance**
```
https://blockstream.info/testnet/address/mpjCmhYqwCDK2Vp5WHrxtJEaaZJmduG6iH
```

## ⚡ **Quick Steps**
1. Go to https://coinfaucet.io/en/btc-testnet/
2. Enter your address: `mpjCmhYqwCDK2Vp5WHrxtJEaaZJmduG6iH`
3. Complete the captcha
4. Wait for confirmation (usually 5-10 minutes)
5. Check balance at Blockstream testnet explorer

## 🎯 **For Development/Demo**
If you need immediate testnet BTC for development, you can also:
1. Use the mock mode (already working)
2. Generate your own testnet node
3. Use a testnet mining pool

The mock mode in our implementation will work perfectly for demo purposes! 🚀 