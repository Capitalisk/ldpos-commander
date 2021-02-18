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
wallet get-multisig-wallet-members                      Get wallet members
wallet public-key                                       Get sig wallet public key
wallet multisig-public-key                              Get multisig wallet public key
config clean                                            Removes config file with server ip, port and networkSymbol
config network-symbol                                   Gets current networkSymbol
transaction transfer                                    Transfer to a wallet
transaction vote                                        Vote a delegate
transaction unvote                                      Unvote a delegate
transaction multisig-transfer                           Transfers to a multisig wallet
transaction verify                                      Verifies a transaction
transaction register-multisig-wallet                    Register a multisigwallet
transaction register-multisig-details                   Register a registerMultisigDetails
transaction register-sig-details                        Register a registerSigDetails
transaction register-forging-details                    Register a registerForgingDetails
accounts current balance                                Check your balance
accounts current public-key                             Check your accounts public key
accounts current transactions                           Check your accounts transactions
accounts current votes                                  Check your accounts votes
accounts current block                                  Check your block
accounts list-by-balance                                List your accounts
accounts pending-transactions                           List pending transactions
delegates get-forging-delegates                         Get list of forging deletes
delegates get-by-weight                                 Delegates by weight in votes
```
