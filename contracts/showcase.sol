// SPDX-License-Identifier: MIT 
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
//prevents ddos attacks
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

import "hardhat/console.sol";

//declare contract
contract Showcase is ReentrancyGuard {
    //total number of items = value, 100 items have been solved .. min 31
    using Counters for Counters.Counter;
    Counters.Counter private _itemIds;
    Counters.Counter private _itemsSold;

  address payable owner;
    // 0.25 , maybe here to make sure that people contributing to restitution have an incentive
    //API is pretty much the same, now more expensive 0.25 MATIC
  uint256 listingPrice = 0.025 ether;

    //!!NEED TO CHANGE THIS the contract address that deploys is the owner is the owner
    constructor() {
        owner = payable(msg.sender);
    }

//values that we want to keep up with maybe add
    struct MarketItem {
        uint itemId;
        address nftContract;
        uint256 tokenId;
        address payable seller;
        address payable owner;
        uint256 price;
        bool sold;  
    //  address payable to restitutuin committe taking that decision
    //  address payable current owner;
    }

//fetch restitution item
    mapping(uint256 => MarketItem) private idToMarketItem;

//here change maybe permissions, who can add more cases to the system, enot everyone can add but everyone can send additional information

    event MarketItemCreated (
        uint indexed itemId,
        address indexed nftContract,
        uint256 indexed tokenId,
        address seller,
        address owner,
        uint256 price,
        bool sold 
    );

  //how much does it cost to list an item -> maybe fetch  if item has been restituted instead of price
  function getListingPrice() public view returns (uint256) {
    return listingPrice;
  }

//places an item for public restitution
function createMarketItem(
    address nftContract,
    uint256 tokenId,
    uint256 price
  ) public payable nonReentrant {
    require(price > 0, "Price must be at least 1 wei");
    require(msg.value == listingPrice, "Price must be");
//send some value to the chain, sending in the listing price along with transaction

    //specifying ITEM ID
    _itemIds.increment();
    uint256 itemId = _itemIds.current(); 

    idToMarketItem[itemId] =  MarketItem(
      itemId,
      nftContract,
      tokenId,
      payable(msg.sender),
        //owner send to empty address
      payable(address(0)),
      price,
      false
    );

    IERC721(nftContract).transferFrom(msg.sender, address(this), tokenId);
    //transfer ownership/ custody

    emit MarketItemCreated(
      itemId,
      nftContract,
      tokenId,
      msg.sender,
      address(0),
      price,
      false
    );
  }

 //function for creating market item aand sale
  function createMarketSale(
    address nftContract,
    uint256 itemId
    ) public payable nonReentrant {
    uint price = idToMarketItem[itemId].price;
    uint tokenId = idToMarketItem[itemId].tokenId;
    require(msg.value == price, "Please submit");

    idToMarketItem[itemId].seller.transfer(msg.value);
    IERC721(nftContract).transferFrom(address(this), msg.sender, tokenId);
    idToMarketItem[itemId].owner = payable(msg.sender);
    idToMarketItem[itemId].sold = true;
    _itemsSold.increment();
    payable(owner).transfer(listingPrice);
  }

  //we want to have different collection sets
  //function that returns sold item, all items created, all things bought

    function fetchMarketItems() public view returns (MarketItem[] memory) {
        uint itemCount = _itemIds.current();
        uint unsoldItemCount = _itemIds.current() - _itemsSold.current();
        //keeping up with a number withing that array, item of numbers created and increment that number
        uint currentIndex = 0;
        
            //market item is equal to new array
        MarketItem[] memory items = new MarketItem[](unsoldItemCount);
        for (uint i = 0; i < itemCount; i++) {
            //check if item is unsolved, only time addres is empty is when item is sold
            if (idToMarketItem[i + 1].owner == address(0)) {
                //create variable current id
                uint currentId = i + 1;
                MarketItem storage currentItem = idToMarketItem[currentId];
                //insert item into the arrat
                items[currentIndex] = currentItem;
                //if the item hasnt been sold
                currentIndex += 1;
            }
        }
        return items;
    }
    //function that returns nfts that the user has created
    function fetchMyNFTs() public view returns (MarketItem[] memory) {
        uint totalItemCount = _itemIds.current();
        uint itemCount = 0;
        uint currentIndex = 0;

        //loop over items 54 min
        for (uint i = 0; i < totalItemCount; i++) {
            if (idToMarketItem[i + 1].owner == msg.sender) {
                itemCount += 1;
            }
        }

        MarketItem[] memory items = new MarketItem[](itemCount);
        for (uint i = 0; i < totalItemCount; i++) {
            if (idToMarketItem[i + 1].owner == msg.sender) {
                uint currentId = i + 1;
                MarketItem storage currentItem = idToMarketItem[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
              //insert item into array and increment current , can use counters too
            }
        }
        return items;
    }

function fetchItemsCreated() public view returns (MarketItem[] memory) {
    uint totalItemCount = _itemIds.current();
    uint itemCount = 0;
    uint currentIndex = 0;

    for (uint i = 0; i < totalItemCount; i++) {
        if (idToMarketItem[i + 1].seller == msg.sender) {
            itemCount += 1;
        }
    }

    MarketItem[] memory items = new MarketItem[](itemCount);
    for (uint i = 0; i < totalItemCount; i++) {
      if (idToMarketItem[i + 1].seller == msg.sender) {
        uint currentId = i + 1;
        MarketItem storage currentItem = idToMarketItem[currentId];
        items[currentIndex] = currentItem;
        currentIndex += 1;
      }
    }
    return items;
  }
}