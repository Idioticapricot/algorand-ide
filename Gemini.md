/playground: should show the multiple templates available

Create /playground route show the multiple templates available get them from this json 
https://raw.githubusercontent.com/nickthelegend/algorand-ide-templates/refs/heads/main/TEMPLATES.json

This is the example of the slug and the 
{
    "hello_world" : {
        "name": "Hello World",
        "desc": "Hello world program with PyTeal/Python.",
        "level" : "Beginner",
        "lang" : "Pyteal"
    },
    "nft_marketplace" : {
        "name": "NFT Marketplace",
        "desc": "A smart contract for creating and managing an NFT marketplace.",
        "level" : "Intermediate",
        "lang" : "Pyteal"
    },
    "tok_minter" : {
        "name": "Token Minter",
        "desc": "A smart contract for minting and managing fungible tokens.",
        "level" : "Intermediate",
        "lang" : "Pyteal"
    }
}


/play/[slug_name]: get the template slug and pass it in here


create /play/[slug_name] route that should fetch the files.ts from the following url

https://raw.githubusercontent.com/nickthelegend/algorand-ide-templates/refs/heads/main/playground/hello_world/files.ts

the files.ts is the file that should be passed for the Algorand-IDE to load the playground template

