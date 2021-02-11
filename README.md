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
Usage: ldpos (OPTIONAL: ip:port) [options] [command]\n
<ip:port>: Default port is 7001. If not provided it will prompt you in the steps.
Options:'
  -v                                             Get the version of the current LDPoS installation
  --help                                         Get info on how to use this command
  --hostname                                     hostname
  --port                                         port
  --network-symbol                               Network symbol (default: 'ldpos')
Commands:

  indexes:
     sync:
         all                                     Syncs all key indexes
         forging                                 Syncs forging key indexes
         multisig                                Syncs multisig key indexes
         sig                                     Syncs sig key indexes
     verify:
         forging                                 Verifies forging key indexes
         multisig                                Verifies multisig key indexes
         sig                                     Verifies sig key indexes
     load:
         forging                                 Loads forging key indexes
         multisig                                Loads multisig key indexes
         sig                                     Loads sig key indexes
     save:
         forging                                 Saves forging key indexes
         multisig                                Saves multisig key indexes
         sig                                     Saves sig key indexes
  wallet:
     generate                                    Generates a wallet
     get                                         Get wallet

  config:                                        Commands for config
     network-symbol                              Gets current networkSymbol
     clean                                       Removes config file with server ip, port 
                                                    and networkSymbol
  transactions:                                  Commands for transactions
     transfer                                    Transfer to a wallet
     vote                                        Vote a a delegate
     unvote                                      Unvote a a delegate
     register-multisig-wallet                    Register a multisigwallet
     register-multisig-details                   Register a registerMultisigDetails
     register-sig-details                        Register a registerSigDetails
     register-forging-details                    Register a registerForgingDetails
  account:                                       Commands for your account
     balance                                     Check your balance
     public-keys                                 Check your public keys
     balance                                     Check your balance
     public-keys                                 Check your public keys
     transactions                                Check your accounts transactions
     votes                                       Check your accounts votes
     block                                       Check your block
     list                                        List your accounts
     pending-transactions                        List pending transactions
```
