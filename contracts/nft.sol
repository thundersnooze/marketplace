// contracts/NFT.sol
// contracts/nft.sol
// SPDX-License-Identifier: MIT 
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

//declaring what are nft is
contract NFT is ERC721URIStorage {
    using Counters for Counters.Counter; //declaring variables
    Counters.Counter private _tokenIds; //important for restitution!, changes in information can be traced
    address contractAddress;


    constructor(address  marketplaceAddress) ERC721("Restitution Tokens", "REST") {
            contractAddress = marketplaceAddress;
    }
//referencing contract address

function createToken(string memory tokenURI) public returns (uint) {
    _tokenIds.increment();
    uint256 newItemId = _tokenIds.current();

    _mint(msg.sender, newItemId);
    _setTokenURI(newItemId, tokenURI);
    //giving the marketplace the approval to transact the token between users
    setApprovalForAll(contractAddress, true);
    return newItemId;
    //in order to know the id of the token, enabling transferring it on the showcase
}

}