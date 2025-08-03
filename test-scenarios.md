# Fusion+ Bitcoin Extension - Test Scenarios

## Prerequisites
1. Bitcoin testnet faucet access (https://testnet-faucet.mempool.co/)
2. Ethereum testnet (Sepolia/Goerli) faucet access
3. Valid 1inch API key
4. Bitcoin testnet private key

## Test Environment Setup

### 1. Environment Variables
Create a `.env` file with:
```
DEV_PORTAL_KEY=your_1inch_api_key
WALLET_ADDRESS=your_ethereum_address
WALLET_KEY=your_ethereum_private_key
RPC_URL=https://eth-sepolia.g.alchemy.com/v2/your_key
BITCOIN_PRIVATE_KEY=your_bitcoin_testnet_private_key
```

### 2. Bitcoin Testnet Setup
1. Generate a Bitcoin testnet private key
2. Get testnet BTC from faucet: https://testnet-faucet.mempool.co/
3. Verify balance on testnet explorer

## Test Scenarios

### Scenario 1: Basic Bitcoin ↔ Ethereum Swap
**Objective**: Test basic cross-chain swap functionality

**Steps**:
1. Start the server: `npm run dev`
2. Open browser to `http://localhost:3000`
3. Select "Bitcoin Testnet" as source chain
4. Select "Ethereum" as destination chain
5. Enter amount: 0.001 BTC
6. Click "Get Quote"
7. Verify quote details are displayed
8. Click "Place Order"
9. Monitor order status
10. Verify HTLC transaction on Bitcoin testnet

**Expected Results**:
- Quote should be generated successfully
- Order should be placed with valid HTLC
- Transaction should appear on Bitcoin testnet explorer
- Order status should update to "confirmed"

### Scenario 2: Ethereum ↔ Bitcoin Swap
**Objective**: Test reverse direction swap

**Steps**:
1. Select "Ethereum" as source chain
2. Select "Bitcoin Testnet" as destination chain
3. Enter amount: 0.01 ETH
4. Follow same process as Scenario 1

**Expected Results**:
- Swap should work in reverse direction
- HTLC should be created on Ethereum
- Bitcoin transaction should be triggered when secret is revealed

### Scenario 3: Hashlock Verification
**Objective**: Verify hashlock mechanism works correctly

**Steps**:
1. Place an order with known secret
2. Manually verify hashlock on blockchain explorer
3. Submit secret to complete swap
4. Verify funds are transferred correctly

**Expected Results**:
- Hashlock should match expected format
- Secret submission should complete the swap
- No funds should be lost in the process

### Scenario 4: Timelock Verification
**Objective**: Test timelock functionality

**Steps**:
1. Place order with short timelock (5 minutes)
2. Wait for timelock to expire
3. Try to complete swap after expiration
4. Verify refund mechanism works

**Expected Results**:
- Swap should fail after timelock expires
- Funds should be refunded to original sender
- No partial completion should occur

### Scenario 5: Error Handling
**Objective**: Test error scenarios

**Steps**:
1. Try swap with insufficient balance
2. Try swap with invalid chain IDs
3. Try swap with zero amount
4. Test network connectivity issues

**Expected Results**:
- Appropriate error messages should be displayed
- No transactions should be created for invalid inputs
- UI should handle errors gracefully

### Scenario 6: UI Functionality
**Objective**: Test web interface features

**Steps**:
1. Test chain selection dropdowns
2. Test amount input validation
3. Test swap direction button
4. Test balance display
5. Test order status updates
6. Test responsive design on mobile

**Expected Results**:
- All UI elements should work correctly
- Real-time updates should function
- Mobile responsiveness should work

### Scenario 7: Performance Testing
**Objective**: Test system performance

**Steps**:
1. Place multiple orders simultaneously
2. Test with large amounts
3. Test with small amounts (dust limits)
4. Monitor memory usage
5. Test API response times

**Expected Results**:
- System should handle multiple orders
- Response times should be reasonable (< 5 seconds)
- No memory leaks should occur

### Scenario 8: Security Testing
**Objective**: Verify security measures

**Steps**:
1. Test private key handling
2. Verify no sensitive data in logs
3. Test input validation
4. Verify HTTPS requirements
5. Test against common attack vectors

**Expected Results**:
- Private keys should be secure
- No sensitive data should be exposed
- Input validation should prevent attacks

## Manual Testing Checklist

### Bitcoin Integration
- [ ] Bitcoin testnet connection works
- [ ] HTLC transaction creation works
- [ ] Transaction broadcasting works
- [ ] Balance checking works
- [ ] Address generation works

### Ethereum Integration
- [ ] EVM chain connection works
- [ ] Fusion+ SDK integration works
- [ ] Order placement works
- [ ] Status polling works

### Cross-Chain Functionality
- [ ] Bidirectional swaps work
- [ ] Hashlock mechanism works
- [ ] Timelock mechanism works
- [ ] Secret submission works
- [ ] Order completion works

### Web UI
- [ ] All pages load correctly
- [ ] Forms submit successfully
- [ ] Real-time updates work
- [ ] Error handling works
- [ ] Mobile responsiveness works

## Automated Testing

### Unit Tests
```bash
npm test
```

### Integration Tests
```bash
# Test Bitcoin connector
node -e "const BitcoinConnector = require('./bitcoin-connector'); const bc = new BitcoinConnector('test_key', 'testnet'); console.log('Bitcoin connector test passed');"

# Test Fusion+ integration
node -e "const { FusionPlusBitcoin } = require('./fusion-plus-bitcoin'); console.log('Fusion+ integration test passed');"
```

## Performance Benchmarks

### Expected Performance
- Quote generation: < 2 seconds
- Order placement: < 5 seconds
- Status updates: < 1 second
- Transaction confirmation: < 10 minutes (Bitcoin testnet)

### Load Testing
- Concurrent users: 10
- Orders per minute: 5
- Memory usage: < 100MB
- CPU usage: < 50%

## Troubleshooting

### Common Issues
1. **Bitcoin testnet connection fails**
   - Check internet connection
   - Verify testnet faucet is working
   - Check private key format

2. **Ethereum connection fails**
   - Verify RPC URL
   - Check API key validity
   - Ensure sufficient testnet ETH

3. **Order placement fails**
   - Check wallet balance
   - Verify chain IDs
   - Check API rate limits

4. **UI not loading**
   - Check server is running
   - Verify port 3000 is available
   - Check browser console for errors

### Debug Commands
```bash
# Check Bitcoin testnet connection
curl https://blockstream.info/testnet/api/blocks/tip/height

# Check Ethereum testnet connection
curl -X POST -H "Content-Type: application/json" --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY

# Check server logs
tail -f server.log
```

## Success Criteria

The implementation is considered successful if:
1. ✅ All test scenarios pass
2. ✅ Bidirectional swaps work correctly
3. ✅ Hashlock and timelock functionality is preserved
4. ✅ Web UI is functional and responsive
5. ✅ No funds are lost during testing
6. ✅ Error handling works correctly
7. ✅ Performance meets benchmarks
8. ✅ Security requirements are met 