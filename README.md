# KickToken contracts v8

The ETH [mainnet](https://etherscan.io/address/0x824a50dF33AC1B41Afc52f4194E2e8356C17C3aC)/[rinkeby](https://rinkeby.etherscan.io/address/0x824a50dF33AC1B41Afc52f4194E2e8356C17C3aC) address is 0x824a50dF33AC1B41Afc52f4194E2e8356C17C3aC.

Token supports public interfaces:
1. [IERC20](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/IERC20.sol) from OpenZeppelin.
2. Burnable - users can burn their own tokens.
3. Pausable - owner of the contract can pause/unpause all token transfers/burnings.
4. [IAccessControl](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/AccessControl.sol) from OpenZeppelin.
5. [IERC1363](https://github.com/vittominacori/erc1363-payable-token/blob/master/contracts/token/ERC1363/IERC1363.sol) - token supports `approveAndCall/transferAndCall` logic.
6. [IERC20Permit](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/extensions/draft-IERC20Permit.sol) from OpenZeppelin.

Contract implements the following custom logic:
1. Burn transfer fee - `burnPercent` parameter determines which part of the transfer value is burnt. This percentage can be changed by the contract owner in the range from 1% to 10%.
2. Distribution transfer fee - `distributionPercent` parameter determines which part of the transfer value is distributed among current token holders (in proportion to their stake). This percentage can be changed by the contract owner in the range from 1% to 10%.
3. Distribute - each token holder can distribute their tokens among all current holders in proportion to their stake.
4. NoIncomeFee accounts - no burn happens and no distribution fee is taken when tokens are transferred to these accounts. Only accounts with `ADMIN_ROLE` can grant and revoke this trait.

Token has following custom owner logic:
1. `multisend` - allows the contract owner to transfer tokens to a batch of accounts without burning and distribution fee. It will be used for initial token swap and potential future token airdrops.
2. `denominate` - allows token denomination.

Contract has the following roles:
1. `OWNER_ROLE` - this role can do all of the above and grant/revoke `ADMIN_ROLE`.
2. `ADMIN_ROLE` - this role can grant/revoke `NoIncomeFee` status and `UNPAUSED_ROLE`.
3. `UNPAUSED_ROLE` - accounts with this role can transfer when the token contract is paused.

## Tests

1. A working Node.js `>=12.0` installation is needed.

2. Install dependencies:
```
    npm install
```

3. Create `.env` file with actual values from `.env.sample`.

4. Run tests:
```
    npx hardhat test
```

5. Run coverage:
```
    npx hardhat coverage
```

6. Run linter:
```
    npx solhint ./contracts/**/*.sol
```

## Deploy

1. Check `scripts/deploy.js` for actual values.

2. Run deploy:
```
    npx hardhat run scripts/deploy.js --network <network-name>
```

3. Verify on Etherscan:
```
    npx hardhat verify --network <network-name> <contract-address> <constructor-arguments>
```
 