const { assert } = require('chai')

const Token = artifacts.require('Token')
const EthSwap = artifacts.require('EthSwap')


require('chai')
    .use(require('chai-as-promised'))
    .should()

    function tokens() {
        return web3.utils.toWei(n, 'ether');
    }

contract('EthSwap', ([deployer, investor]) => {

    let token, ethSwap

    before(async () => {
        let token = await Token.new()
        let ethSwap = await EthSwap.new(token.address)
        await token.transfer(ethSwap.address, tokens(1000000))
    })
    
    describe('Token deployment', async() => {
        it('contract has a name', async() => {
            const name = await token.name()
            assert.equal(name, 'MMD Token')
        })
    })

    describe('EthSwap deployment', async() =>{

        it('contract has a name', async () => {
            const name = await ethSwap.name()
            assert.equal(name, 'EthSwap Instant Exchange')
        })

        it('contract has tokens', async () => {
            let balance = await token.balanceOf(ethSwap.address)
            assert.equal(balance.toString(), tokens(1000000))
        })
    })

    describe('buy tokens', async() => {        
        let result 
        before(async () => {
            //buy tokens before each example
            result = await ethSwap.buyTokens({ from: investor, value: web3.utils.toWei('1', 'ether')})
        })

        it('allows user to instantly purchase tokens form ethswap for a fixed price', async () => {
            //investor receives token balance after purchase
            let investorBalance = await token.balanceOf(investor)
            assert.equal(investorBalance.toString(), tokens('100'))

            //check ethSwap balance after purchase
            let ethSwapBalance 
            ethSwapBalance = await token.balanceOf(ethSwap.address)
            assert.equal(ethSwapBalance.toString(), tokens('999900'))

            //investor got token
            ethSwapBalance = await web3.eth.getBalance(ethSwap.address)
            assert.equal(ethSwapBalance.toString(), web3.utils.toWei('1', 'Ether'))

            const event = result.logs[0].args
            assert.equal(event.account, investor)
            assert.equal(event.token, token.address)
            assert.equal(event.amount.toString(), tokens('100').toString())
            assert.equal(event.rate.toString(), '100')
        }) 
    })


    describe('sell tokens', async() => {
        
        let result 

        before(async () => {
            //Investor must approve tokens before the purchase
            await token.approve(ethSwap.address, tokens('100'), { from: investor })
            //investor sells tokens
            result = await ethSwap.sellTokens(tokens('100'), { from: investor })
        })

        it('allows user to instantly purchase tokens form ethswap for a fixed price', async () => {
            //investor receives token balance after purchase
            let investorBalance = await token.balanceOf(investor)
            assert.equal(investorBalance.toString(), tokens('0'))

            //check ethSwap balance after purchase
            let ethSwapBalance 
            ethSwapBalance = await token.balanceOf(ethSwap.address)
            assert.equal(ethSwapBalance.toString(), tokens('1000000'))

            //investor got token
            ethSwapBalance = await web3.eth.getBalance(ethSwap.address)
            assert.equal(ethSwapBalance.toString(), web3.utils.toWei('0 ', 'Ether'))

            //check logs to ensure event was emitted with correct data
            const event = result.logs[0].args
            assert.equal(event.account, investor)
            assert.equal(event.token, token.address)
            assert.equal(event.amount.toString(), tokens('100').toString())
            assert.equal(event.rate.toString(), '100')

            //Failure: investor cant sell more tokens than they have
            await ethSwap.sellTokens(tokens('500'), { from: investor}).should.be.rejected;
        }) 
    })


})    

    

