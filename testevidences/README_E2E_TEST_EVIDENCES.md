# End to End Testing

## Commands

```shell
npx hardhat run interactions/end-to-end/InteractingWithCrowdFundingContract.js --network localhost

npx hardhat run interactions/end-to-end/InteractingWithCrowdFundingFactoryContract.js --network localhost
```

## Test Evidence(s)

The logs of the end to end tests are captured in [e2e-crowd-funding-test-evidence.txt](txtfiles/e2e-crowd-funding-test-evidence.txt) file.

![E2E Testing Evidence](imgs/e2e-test-evidence.png)
![E2E Testing Evidence - Owner Functions](imgs/e2e-test-evidence-own-fns.png)

Test Evidence for Factory contract functions

![Factory Functions Test Evidence](imgs/e2e-factory-fns-test-evidence.png)
