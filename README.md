In this project, the logic of a multiple-choice question is stored in a smart contract. The number of choices is not limited. Only the creator of the contract has the opportunity to change the title of the question and add new choices. The back-end part of the application is written in the Solidity programming language. The user interface was created using the Truffle framework and further developed with modern HTML and JavaScript code. This project involves the manipulation of events.

## Survey contract

- The contract [Survey.sol](https://github.com/DGalinec/survey-truffle/blob/master/contracts/Survey.sol) is written in the Solidity programming language `^0.4.24`.

- The contract has been pre-compiled and pre-tested on the [Remix](http://remix.ethereum.org/#optimize=false&version=soljson-v0.4.24+commit.e67f0147.js) Solidity IDE.

- The contract is compiled and deployed `truffle migrate --reset` during the development phase using the [truffle suite](https://truffleframework.com/) on the [Ganache](https://github.com/trufflesuite/ganache) personnal blockchain. The deployment script is in [2_deploy_contracts.js](https://github.com/DGalinec/survey-truffle/blob/master/migrations/2_deploy_contracts.js).

- The [Mocha](https://mochajs.org/) JavaScript test framework paired with the [Ganache](https://github.com/trufflesuite/ganache) personnal blockchain for Ethereum development were used to test the behaviour of the different contract functions on the blockchain. The JavaScript file containing the different tests is named [Survey.test.js](https://github.com/DGalinec/survey-truffle/blob/master/test/Survey.test.js).

- The contract was deployed on the [Rinkeby](https://www.rinkeby.io/#stats) network (Ethereum testnet at address [0x7dDB372ad807b53694d20690f41dA590AD411D7A](https://rinkeby.etherscan.io/address/0x7dDB372ad807b53694d20690f41dA590AD411D7A) using [truffle hdwallet provider](https://github.com/trufflesuite/truffle-hdwallet-provider).

## User interface

- The user interface was generated using the Truffle framework `npm install -g truffle` and more specifically the [Truffle pet-shop box](https://github.com/truffle-box/pet-shop-box) `truffle unbox pet-shop`.

- JavaScript source code of the user interface with calls to the blockchain is in [app.js](https://github.com/DGalinec/survey-truffle/blob/master/src/js/app.js) file.

- A number of Solidity events are being watch in [app.js](https://github.com/DGalinec/survey-truffle/blob/master/src/js/app.js).

```
votedEvent                 - a user voted -
addedChoiceEvent           - a new choice has been added by the creator of the contract -
addedQuestionEvent         - the creator of the contract changed the question of the survey -
changed MetaMask account   - the user account has changed -
```

- Contract requires [MetaMask](https://metamask.io/) plugin to be installed in your Chrome or FireFox browser and be settled on the Custom RPC: `http://localhost:7545`.

- To run the user interface type `~/$ npm run dev`. Application will start on `localhost: 3000` in your browser. 

## Folder structure

After cloning files and running `~/$ npm install` in your working directory, your project should look like this:

```
survey-truffle/
  bs-config.json
  contracts/
    Migrations.sol
    Survey.sol
  migrations/
    1_initial_migration.js
    2_deploy_contracts.js
  node_modules/
  package.json
  README.md
  src/
    css/
    fonts/
    images/
    index.html
    js/
      app.js
      bootstrap.min.js
      truffle-contract.js
      web3.min.js
  test/
    Survey.test.js
  truffle.js
```