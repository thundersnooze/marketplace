// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/IERC1155MetadataURI.sol";

//event PermanentURI(string _value, uint256 indexed _id);

contract RCopinion is ERC1155, Ownable {
    uint256 public constant Cat_01 = 0;
    uint256 public constant Cat_02 = 1;
    uint256 public constant Cat_03 = 2;
    uint256 public constant Cat_04 = 3;
    
    constructor() ERC1155(".../opinion") {
        _mint(msg.sender, Cat_01, 37, "");
        _mint(msg.sender, Cat_02, 27, "");
        _mint(msg.sender, Cat_03, 1, "");
        _mint(msg.sender, Cat_04, 6, "");
    }
    
    function mint(address account, uint256 id, uint256 amount) public onlyOwner {
        _mint(account, id, amount, "");
    }
}