# ldpos-commander
CLI client for LDPoS blockchains
EXAMPLE NODE: `34.227.22.98` PORT: `7001`

## Link the cli globally
You will be able to use it as if it was a globally installed package
```js
npm i
npm link
```

## Commands
```
This interface can be used both interactively and non-interactively:

Usage interactively: ldpos (OPTIONAL: -pmf)

OR

Usage non-interactively: ldpos (OPTIONAL: -pmf) (OPTIONAL: ip or ip:port) [command]
ip:port - Default port is 7001. If not provided it will prompt you in the steps.
eg.: ldpos 192.168.0.1 wallet get
eg.: ldpos 192.168.0.1:7003 wallet get

Options accepted both interactively and non-interactively:
  (option -p) PASSPHRASE
  (option -m) MULTISIGPASSPHRASE
  (option -f) FORGINPASSPHRASE

login                                                                                                  Login with a passphrase. Intented for interactive mode only
exit                                                                                                   Exits the process
v                                                                                                      No description available
version                                                                                                No description available
wallet list outbound-transactions                                                                      Check your outbound transactions
wallet list inbound-transactions                                                                       Check your outbound transactions
wallet list pending-transactions inbound                                                               Check your pending outbound transactions
wallet list pending-transactions outbound                                                              Check your pending inbound transactions
wallet list votes                                                                                      Check your votes
wallet get                                                                                             Check your account
config clean passphrases                                                                               Removes the passphrase
config clean signatures default-path                                                                   Removes the default path (IMPORTANT: this action is irreversible)
config clean signatures                                                                                Removes all signatures in the default path (IMPORTANT: this action is irreversible)
config clean                                                                                           Removes config file with server ip, port and networkSymbol (IMPORTANT: this action is irreversible)
config network-symbol current                                                                          Gets current networkSymbol
config network-symbol change                                                                           Change the protocol
transaction get                                                                                        Get a transaction, accepts an id as argument. If not provided it prompts it.
transaction create multisig-transfer                                                                   Transfers to a multisig wallet
transaction sign multisig-transfer                                                                     Transfers to a multisig wallet
transaction post transfer                                                                              Transfer to a wallet
transaction post vote                                                                                  Vote a delegate
transaction post unvote                                                                                Unvote a delegate
transaction post multisig-transaction                                                                  Transfers to a multisig wallet
transaction post register-multisig-wallet                                                              Register a multisigwallet
transaction post register-multisig-details                                                             Register a registerMultisigDetails
transaction post register-sig-details                                                                  Register a registerSigDetails
transaction post register-forging-details                                                              Register a registerForgingDetails
transaction count pending                                                                              List pending transactions
account list by-balance                                                                                List accounts
account list multisig-wallet-members                                                                   Get wallet members
account get                                                                                            Get a account, accepts an address as argument if run non-interactively. If not provided it prompts it.
account generate                                                                                       Generates a new wallet
delegate get                                                                                           Gets a delegate, accepts an address as argument if run non-interactively. If not provided it prompts it.
delegate list forging-delegates                                                                        List forging deletes
delegate list by-vote-weight                                                                           Delegates by weight in votes
```
