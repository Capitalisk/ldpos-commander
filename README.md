# ldpos-commander
CLI client for LDPoS blockchains

## Link the cli globally
You will be able to use it as if it was a globally installed package
```js
npm i
npm link
```

## Commands
```
Usage: ldpos                                     To use the command line interactively

OR

Usage: ldpos (OPTIONAL: ip:port) [options] [command]
<ip:port>: Default port is 7001. If not provided it will prompt you in the steps.
eg.: ldpos 192.168.0.1 wallet get
eg.: ldpos 192.168.0.1:7003 wallet get

exit                                                    Exits the process
version                                                 Displays version
indexes sync all                                        Syncs all key indexes
indexes sync forging                                    Syncs forging key indexes
indexes sync multisig                                   Syncs multisig key indexes
indexes sync sig                                        Syncs sig key indexes
indexes verify forging                                  Verifies forging key indexes
indexes verify multisig                                 Verifies multisig key indexes
indexes verify sig                                      Verifies sig key indexes
indexes load forging                                    Loads forging key indexes
indexes load multisig                                   Loads multisig key indexes
indexes load sig                                        Loads sig key indexes
indexes save forging                                    Saves forging key indexes
indexes save multisig                                   Saves multisig key indexes
indexes save sig                                        Saves sig key indexes
wallet balance                                          Get balance of prompted wallet
wallet address                                          Get address of signed in wallet
wallet generate                                         Generates a new wallet
wallet get                                              Get wallet
wallet getMultisigWalletMembers                         Get wallet members
wallet publicKey                                        Get sig wallet public key
wallet multisigPublicKey                                Get multisig wallet public key
config clean                                            Removes config file with server ip, port and networkSymbol
config networkSymbol                                    Gets current networkSymbol
transaction transfer                                    Transfer to a wallet
transaction vote                                        Vote a delegate
transaction unvote                                      Unvote a delegate
transaction multisigTransfer                            Transfers to a multisig wallet
transaction verify                                      Verifies a transaction
transaction registerMultisigWallet                      Register a multisigwallet
transaction registerMultisigDetails                     Register a registerMultisigDetails
transaction registerSigDetails                          Register a registerSigDetails
transaction registerForgingDetails                      Register a registerForgingDetails
accounts current balance                                Check your balance
accounts current publicKey                              Check your accounts public key
accounts current transactions                           Check your accounts transactions
accounts current votes                                  Check your accounts votes
accounts current block                                  Check your block
accounts listByBalance                                  List your accounts
accounts pendingTransactions                            List pending transactions
delegates getForgingDelegates                           Get list of forging deletes
delegates getByWeight                                   Delegates by weight in votes
```
