# ldpos-commander

CLI client for LDPoS blockchains

EXAMPLE NODE: `34.227.22.98` PORT: `8001`
```
ldpos 34.227.22.98:8001 account list by-balance
````

## Installation

```js
npm i -g ldpos-commander
```

## Commands

```
This interface can be used both interactively and non-interactively:

Usage interactively: ldpos (OPTIONAL: -cpmf) (OPTIONAL: -w walletAddress)

OR

Usage non-interactively: ldpos (OPTIONAL: -cpmf) (OPTIONAL: -w walletAddress) (OPTIONAL: ip or ip:port) [command]
ip:port - Default port is 8001. If not provided it will prompt you in the steps.
eg.: ldpos 192.168.0.1 wallet get
eg.: ldpos 192.168.0.1:7003 wallet get

Options accepted both interactively and non-interactively:
  (option -c) Start with new configurations
  (option -p) PASSPHRASE
  (option -m) MULTISIG_PASSPHRASE
  (option -f) FORGING_PASSPHRASE
  (option -w) WALLET_ADDRESS
  
login                                                          Login with a passphrase. Intended for interactive mode only
exit                                                           Exits the process
v                                                              No description available
version                                                        No description available
wallet list outbound-transactions                              Check your outbound transactions
wallet list inbound-transactions                               Check your inbound transactions
wallet list pending-transactions outbound                      Check your pending outbound transactions
wallet list votes                                              Check your votes
wallet get balance                                             Get the balance of your wallet
wallet get                                                     Check your account
config show                                                    Get filepaths to the configs
config clean key-indexes                                       Cleans key indexes
config clean passphrases                                       Removes the passphrase
config clean signatures default-path                           Removes the default path (IMPORTANT: this action is irreversible)
config clean signatures                                        Removes all signatures in the default path (IMPORTANT: this action is irreversible)
config clean                                                   Removes config file with server ip, port and networkSymbol (IMPORTANT: this action is irreversible)
config network-symbol current                                  Gets current networkSymbol
config network-symbol change                                   Change the protocol
transaction list                                               Get a list of all transactions on the chain by timestamp
transaction get                                                Get a transaction, accepts an id as argument. If not provided it prompts it.
transaction create multisig-transfer                           Transfers to a multisig wallet
transaction sign multisig-transfer                             Transfers to a multisig wallet
transaction post transfer                                      Transfer to a wallet
transaction post vote                                          Vote a delegate
transaction post unvote                                        Unvote a delegate
transaction post multisig-transaction                          Transfers to a multisig wallet
transaction post register-multisig-wallet                      Register a multisigwallet
transaction post register-multisig-details                     Register a registerMultisigDetails
transaction post register-sig-details                          Register a registerSigDetails
transaction post register-forging-details                      Register a registerForgingDetails
transaction count pending                                      List pending transactions
account list outbound-transactions                             Check the outbound transactions of a wallet address
account list inbound-transactions                              Check the inbound transactions of a wallet address
account list pending-transactions                              Check the pending outbound transactions of a wallet address
account list votes                                             Check the votes of a wallet address
account list by-balance                                        List accounts
account list multisig-wallet-members                           Get wallet members
account get balance                                            Get the balance of an account
account get                                                    Get a account, accepts an address as argument if run non-interactively. If not provided it prompts it.
account generate                                               Generates a new wallet
passphrase generate                                            Generates a new passphrase
delegate get                                                   Gets a delegate, accepts an address as argument if run non-interactively. If not provided it prompts it.
delegate list forging-delegates                                List forging deletes
delegate list by-vote-weight                                   Delegates by weight in votes
delegate forging                                               Check if delegate is forging
node info                                                      Get info about the node
block get max-height                                           Get the max height
block get                                                      Get block by id
block list                                                     List all blocks
fees                                                           List fees
```
