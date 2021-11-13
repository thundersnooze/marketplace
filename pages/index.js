import { ethers } from 'ethers'
//react hook allows to envoce funktion when component loads
import { useEffect, useState } from 'react'
// data fetching library, web 3 to connect to wallet
import axios from 'axios'
import Web3Modal from "web3modal"

//reference to marketplace address and nft address
import { 
  nftaddress, nftmarketaddress
} from '../config'
//json representation of our smart contract and allows to interact from the client side contained in the abis- importing it here 
import NFT from '../artifacts/contracts/nft.sol/NFT.json'
import Market from '../artifacts/contracts/showcase.sol/Showcase.json'

//two pieesces of states, empty function, when app loads no nfts, call array and update local state. Loading - variable and set loading state- allows us to update the variable
export default function Home() {
  const [nfts, setNfts] = useState([])
  const [loadingState, setLoadingState] = useState('not-loaded')
  //setLoadingState('loaded')
  
  //call our smart contract and fetch our NFTS
  useEffect(() => {
    loadNFTs()
  }, [])
  
//working with eth provider, dont need to know anything about the users

    async function loadNFTs() {    
      //to matic
      //const provider = new ethers.providers.JsonRpcProvider("https://rpc-mainnet.maticvigil.com")
      //to localhost
      const provider = new ethers.providers.JsonRpcProvider()
      const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider)
      const marketContract = new ethers.Contract(nftmarketaddress, Market.abi, provider)
      const data = await marketContract.fetchMarketItems()
      
      const items = await Promise.all(data.map(async i => {
        const tokenUri = await tokenContract.tokenURI(i.tokenId)
        const meta = await axios.get(tokenUri)
        let price = ethers.utils.formatUnits(i.price.toString(), 'ether')
        let item = {
          price,
          tokenId: i.tokenId.toNumber(),
          seller: i.seller,
          owner: i.owner,
          image: meta.data.image,
          name: meta.data.name,
          description: meta.data.description,
        }
        return item
      }))
      setNfts(items)
      setLoadingState('loaded') 
    }
    async function buyNft(nft) {
      const web3Modal = new Web3Modal()
      const connection = await web3Modal.connect()
      const provider = new ethers.providers.Web3Provider(connection)
      const signer = provider.getSigner()
      const contract = new ethers.Contract(nftmarketaddress, Market.abi, signer)
  
      const price = ethers.utils.parseUnits(nft.price.toString(), 'ether')
      const transaction = await contract.createMarketSale(nftaddress, nft.tokenId, {
        value: price
      })
      await transaction.wait()
      loadNFTs()
    }
    if (loadingState === 'loaded' && !nfts.length) return (<h1 className="px-20 py-10 text-3xl">No items in binding opinion</h1>)
    return (
      <div className="flex justify-center">
        <div className="px-4" style={{ maxWidth: '1600px' }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
            {
              nfts.map((nft, i) => (
                <div key={i} className="border shadow rounded-xl overflow-hidden">
                  <img src={nft.image} />
                  <div className="p-4">
                    <p style={{ height: '64px' }} className="text-2xl font-semibold">{nft.name}</p>
                    <div style={{ height: '70px', overflow: 'hidden' }}>
                      <p className="text-gray-400">{nft.description}</p>
                    </div>
                  </div>
                  <div className="p-4 bg-black">
                    <p className="text-2xl mb-4 font-bold text-white">{nft.price} ETH</p>
                    <button className="w-full bg-pink-500 text-white font-bold py-2 px-12 rounded" onClick={() => buyNft(nft)}>Buy</button>
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      </div>
    )
  }

/*give user ability to buy nft
async function buyNft(nft) {
  const web3Modal = new Web3Modal()
  const connection = await web3Modal.connect()
  const provider = new ethers.providers.Web3Provider(connection)

  const signer = provider.getSigner()
  const contract = new ethers.Contract(nftmarketaddress, Market.abi, signer)
  // transferring it back from string to number to use here
  const price = ethers.utils.parseUnits(nft.price.toString(), 'ether')

  // create market sale

  const transaction = await contract.createMarketSale(nftaddress, nft.tokenId, {
    value: price
  })
  //reload the string to remove nft by reloading 
  await transaction.wait()
  loadNFTs()
}
*/