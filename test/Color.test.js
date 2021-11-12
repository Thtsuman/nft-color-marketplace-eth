const { assert } = require('chai');

const Color = artifacts.require('./Color.sol')

require('chai')
    .use(require('chai-as-promised'))
    .should();

contract('Color', (accounts) => {
    let contract;

    before(async () => {
        contract = await Color.deployed()
    })

    describe('deployment', async () => {
        it('deploys successfully', async () => {
            const address = contract.address

            assert.notEqual(address, '')
        })

        it('has a name', async () => {
            const name = await contract.name()

            assert.equal(name, 'Color')
        })

        it('has a symbol', async () => {
            const symbol = await contract.symbol()

            assert.equal(symbol, 'COLOR')
        })
    })

    describe('minting', async () => {
        it('create a new token', async () => {

            const result = await contract.mint('#ffffff')
            const totalSupply = await contract.totalSupply()

            assert.equal(totalSupply, 1)
            const event = result.logs[0].args

            assert.equal(event.tokenId.toNumber(), 0, 'id is correct')
            assert.equal(event.from, '0x0000000000000000000000000000000000000000', 'from is correct')
            assert.equal(event.to, accounts[0], 'to is correct')

            await contract.mint('#ffffff').should.be.rejected;
        })
    })

    describe('indexing', async () => {
        it('lists colors', async () => {
            // mint 3 more token
            await contract.mint('#fffffd')
            await contract.mint('#000000')
            await contract.mint('#4e3434')

            const totalSupply = await contract.totalSupply()

            let color;
            let results = [];

            for(var i = 1; i <= totalSupply; i++ ) {
                color = await contract.colors(i - 1);
                results.push(color)
            }

            let expected = ['#ffffff', '#fffffd', '#000000', '#4e3434']

            assert.equal(results.join(','), expected.join(','))

        })
    })
})