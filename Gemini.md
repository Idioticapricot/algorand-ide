///Below is ARC56 .json contract


{
  "name": "BadgeContract",
  "desc": "",
  "methods": [
    {
      "name": "createApplication",
      "args": [
        {
          "name": "creatorAddress",
          "type": "address"
        },
        {
          "name": "tokenName",
          "type": "string"
        },
        {
          "name": "assetID",
          "type": "uint64"
        },
        {
          "name": "numClaims",
          "type": "uint64"
        },
        {
          "name": "maxClaims",
          "type": "uint64"
        },
        {
          "name": "expiryDate",
          "type": "uint64"
        },
        {
          "name": "amountToSend",
          "type": "uint64"
        },
        {
          "name": "amountRemaining",
          "type": "uint64"
        }
      ],
      "returns": {
        "type": "void"
      },
      "actions": {
        "create": [
          "NoOp"
        ],
        "call": []
      }
    },
    {
      "name": "createAsset",
      "args": [
        {
          "name": "totalTickets",
          "type": "uint64"
        },
        {
          "name": "assetUrl",
          "type": "string"
        }
      ],
      "returns": {
        "type": "void"
      },
      "actions": {
        "create": [],
        "call": [
          "NoOp"
        ]
      }
    },
    {
      "name": "claimDrop",
      "args": [],
      "returns": {
        "type": "void"
      },
      "actions": {
        "create": [],
        "call": [
          "NoOp"
        ]
      }
    }
  ], ........ETC



///Below is ARC32 Contract ...


  { "contract": {
    "name": "AirdropContract",
    "desc": "",
    "methods": [
      {
        "name": "createApplication",
        "args": [
          {
            "name": "creatorAddress",
            "type": "address"
          },
          {
            "name": "tokenName",
            "type": "string"
          },
          {
            "name": "assetID",
            "type": "uint64"
          },
          {
            "name": "numClaims",
            "type": "uint64"
          },
          {
            "name": "maxClaims",
            "type": "uint64"
          },
          {
            "name": "expiryDate",
            "type": "uint64"
          },
          {
            "name": "amountToSend",
            "type": "uint64"
          },
          {
            "name": "amountRemaining",
            "type": "uint64"
          }
        ],
        "returns": {
          "type": "void"
        }
      },
      {
        "name": "createAsset",
        "args": [
          {
            "name": "totalTickets",
            "type": "uint64"
          },
          {
            "name": "assetUrl",
            "type": "string"
          }
        ],
        "returns": {
          "type": "void"
        }
      },
      {
        "name": "claimDrop",
        "args": [],
        "returns": {
          "type": "void"
        }
      }
    ]
  }
}



///Below is ARC4 Contract


{
  "name": "AirdropContract",
  "desc": "",
  "methods": [
    {
      "name": "createApplication",
      "args": [
        {
          "name": "creatorAddress",
          "type": "address"
        },
        {
          "name": "tokenName",
          "type": "string"
        },
        {
          "name": "assetID",
          "type": "uint64"
        },
        {
          "name": "numClaims",
          "type": "uint64"
        },
        {
          "name": "maxClaims",
          "type": "uint64"
        },
        {
          "name": "expiryDate",
          "type": "uint64"
        },
        {
          "name": "amountToSend",
          "type": "uint64"
        },
        {
          "name": "amountRemaining",
          "type": "uint64"
        }
      ],
      "returns": {
        "type": "void"
      }
    },
    {
      "name": "createAsset",
      "args": [
        {
          "name": "totalTickets",
          "type": "uint64"
        },
        {
          "name": "assetUrl",
          "type": "string"
        }
      ],
      "returns": {
        "type": "void"
      }
    },
    {
      "name": "claimDrop",
      "args": [],
      "returns": {
        "type": "void"
      }
    }
  ]
}



Above are the examples of how a json is..
So when a user clicks deploy button deploy artifact is called i want to get the name of the file if the file has .arc56.json at the end .arc32.json at the end .arc4.json at the end...


and then store then while deploying use the createApplication method ...  

const deployResult = await appFactory.send.create({sender: account.addr.toString() , signer:algosdk.makeBasicAccountTransactionSigner(account) , method: "createApplication",args: []}) 

Ask the user ARGS if the smart contract contains args Example the below method contains the following args so ask the user, show a modal with the number of args to pass and the textfield to enter .. and deploy button at the bottom of the modal 

{
      "name": "createApplication",
      "args": [
        {
          "name": "creatorAddress",
          "type": "address"
        },
        {
          "name": "tokenName",
          "type": "string"
        },
        {
          "name": "assetID",
          "type": "uint64"
        },
        {
          "name": "numClaims",
          "type": "uint64"
        },
        {
          "name": "maxClaims",
          "type": "uint64"
        },
        {
          "name": "expiryDate",
          "type": "uint64"
        },
        {
          "name": "amountToSend",
          "type": "uint64"
        },
        {
          "name": "amountRemaining",
          "type": "uint64"
        }
      ],
      "returns": {
        "type": "void"
      }
    },

