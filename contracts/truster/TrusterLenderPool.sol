// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "../DamnValuableToken.sol";

/**
 * @title TrusterLenderPool
 * @author Damn Vulnerable DeFi (https://damnvulnerabledefi.xyz)
 */
contract TrusterLenderPool is ReentrancyGuard {
    using Address for address;

    DamnValuableToken public immutable token;

    error RepayFailed();

    constructor(DamnValuableToken _token) {
        token = _token;
    }

    function flashLoan(uint256 amount, address borrower, address target, bytes calldata data)
        external
        nonReentrant
        returns (bool)
    {
        uint256 balanceBefore = token.balanceOf(address(this));

        token.transfer(borrower, amount);
        // functionCall是address的一个内置函数，作用类似于call函数，所以只需要将target改成token地址
        // 然后调用approve(address,uint256)将token授权给自己的地址，授权之后转账即可
        target.functionCall(data);

        if (token.balanceOf(address(this)) < balanceBefore)
            revert RepayFailed();

        return true;
    }
}
