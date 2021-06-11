# KickToken contracts v8

Token supports public interfaces:
1. [IERC20](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/IERC20.sol) from OpenZeppelin.
2. Burnable - users can burn their tokens.
3. Pausable - the owner of the contract can pause/unpause all token transfers/burnings.
4. [IAccessControl](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/access/AccessControl.sol) from OpenZeppelin.
5. [IERC1363](https://github.com/vittominacori/erc1363-payable-token/blob/master/contracts/token/ERC1363/IERC1363.sol) - token supports `approveAndCall/transferAndCall` logic.
6. [IERC20Permit](https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/token/ERC20/extensions/draft-IERC20Permit.sol) from OpenZeppelin.

Contract implements next custom logic:
1. Burn transfer fee - `burnPercent` parameter means which part of transfer value is burning. This percent can be changed by the contract owner in the range from 1% to 10%.
2. Distribute transfer fee - `distributionPercent` parameter means which part of transfer value is distributing among current token holders (in proportion to their stake). This percent can be changed by the contract owner in the range from 1% to 10%.
3. Distribute - each token holder can distribute their tokens among all current holders in proportion to their stake.
4. NoIncomeFee accounts - no burn and distribute fee if tokens are transferred to these accounts. Only accounts with `ADMIN_ROLE` can grant and revoke this trait.

Token has custom owner logic:
1. `multisend` - allows the owner to transfer tokens to a batch of accounts without the burn and distribute fee. It will be used for initial token swap and possible future token airdrops.
2. `burnBatch` - allows the owner to burn tokens from a batch of accounts without their allowance. It will be used in case of token thefts or emergencies.
3. `disributeBatch` - allows the owner to distribute tokens from a batch of accounts without their allowance. It will be used in case of token thefts or emergencies.
4. `denominate` - allows token denomination.

The contract has next roles:
1. `OWNER_ROLE` - this role can all of the above list and grant/revoke `ADMIN_ROLE`.
2. `ADMIN_ROLE` - this role can grant/revoke `NoIncomeFee` status and `UNPAUSED_ROLE`.
3. `UNPAUSED_ROLE` - accounts with this role can transfer when the token is paused.

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

## Deploy

1. Check `scripts/deploy.js` for actual values.

2. Run deploy:
```
    npx hardhat run scripts/deploy.js --network <network-name>
```
 