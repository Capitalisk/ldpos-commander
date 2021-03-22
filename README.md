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

exit                                                                                                   Exits the process
v                                                                                                      No description available
version                                                                                                No description available
wallet list transactions                                                                               Check your transactions
wallet list votes                                                                                      Check your votes
wallet get balance                                                                                     Check your balance
wallet get sig-public-key                                                                              Check your public key
wallet get forging-public-key                                                                          Check your forging public key
wallet get multisig-public-key                                                                         Check your multisig public key
wallet get address                                                                                     Get address of signed in wallet
wallet get <custom-property>                                                                           Get a custom property on the wallet
config clean passphrases                                                                               Removes the passphrase
config clean signatures default-path                                                                   Removes the default path (IMPORTANT: this action is irreversible)
config clean signatures                                                                                Removes all signatures in the default path (IMPORTANT: this action is irreversible)
config clean                                                                                           Removes config file with server ip, port and networkSymbol (IMPORTANT: this action is irreversible)
config network-symbol current                                                                          Gets current networkSymbol
config network-symbol change                                                                           Change the protocol
transaction get <custom-property>                                                                      Get a custom property on the transaction
transaction get type                                                                                   Get the transaction type
transaction get fee                                                                                    Get the transaction fee
transaction get timestamp                                                                              Get the transaction timestamp
transaction get message                                                                                Get the transaction message
transaction get sender-address                                                                         Get the transaction sender address
transaction get sig-public-key                                                                         Get the transaction sig public key
transaction get next-sig-public-key                                                                    Get the transaction next sig public key
transaction get next-sig-key-index                                                                     Get the transaction next sig key index
transaction get sender-signature-hash                                                                  Get the transaction sender signature hash
transaction get block-id                                                                               Get the transaction block id
transaction get index-in-block                                                                         Get the transaction index in block
transaction get new-sig-public-key                                                                     Get the transaction new sig public key
transaction get new-next-sig-public-key                                                                Get the transaction new next sig public key
transaction get new-next-sig-key-index                                                                 Get the transaction new next sig key index
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
account get balance                                                                                    Get balance of prompted wallet
account get wallet                                                                                     Get wallet
account get sig-public-key                                                                             Get a sig public key
account get multisig-public-key                                                                        Get a multisig public key
account get forging-public-key                                                                         Get a multisig public key
account get <custom-property>                                                                          Get a custom property on the wallet
account generate                                                                                       Generates a new wallet
delegate get vote-weight                                                                               Get a delegates vote weight
delegate get update-height                                                                             Get a delegates update height
delegate get <custom-property>                                                                         Get a custom property on the delegate
delegate list forging-delegates                                                                        List forging deletes
delegate list by-vote-weight                                                                           Delegates by weight in votes
```
