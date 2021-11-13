const { expect } = require("chai");
const { ethers } = require("hardhat");


//simulate deploying contracts and creating new nft and purchasing it from somebody else 
describe("NFTMarket", function () {
  it("Should create and excute market sales", async function (){
    //get reference to the market
    const Market = await ethers.getContractFactory("NFTMarket")
    const market = await Market.deploy()
    await market.deployed()
    const marketAddress = market.address

    //deploy nft contract, reference to the nft 
    const NFT = await ethers.getContractFactory("NFT")
    const nft = await NFT.deploy(marketAddress)
    await nft.deployed
    const nftContractAddress = nft.address

    //need a way to find out how much the listing price is 
    let listingPrice = await market.getListingPrice()
    listingPrice = listingPrice.toString()

    //how much is the current price - would want to change it to who is the current owner
    const auctionPrice = ethers.utils.parseUnits('100', 'ether')

    //create tokens 
    await nft.createToken("https://mytokenlocation.com")
    await nft.createToken("https://mytokenlocation2.com")

    // passing current place?
    await market.createMarketItem(nftContractAddress, 1, auctionPrice, { value: listingPrice})
    await market.createMarketItem(nftContractAddress, 2, auctionPrice, { value: listingPrice})

    //how to get different addresses form different users, this case test accounts, we dont want the buyer to be the same person as the seller
    const [_, buyerAddress] = await ethers.getSigners()
    
    //use buyer address to connect to market, passing address, id and value 
    await market.connect(buyerAddress).createMarketSale(nftContractAddress, 1, { value:
    auctionPrice})

    //testing querying for the items
    let items = await market.fetchMarketItems()
    // things done lcient side see note
    // asynchronous mapping odf token uri passing the id passing the actual value of the id, allows doing asynchronous mapping
      items = await Promise.all(items.map(async i => {
        const tokenUri = await nft.tokenURI(i.tokenId)
        //values we want to get back, integers from instagram to stiring, defining seller and owner just by address
        let item = {
          price: i.price.toString(),
          tokenId: i.tokenId.toString(),
          seller: i.seller,
          owner: i.owner,
          tokenUri
        }
        return item
      }))
      //want to return only certail values

    console.log('items:', items)
  });
});
