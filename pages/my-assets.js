import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import axios from 'axios'
import Web3Modal from "web3modal"

//references to address
import{
    nftmarketaddress, nftaddress
} from '../config'

import NFT from '../artifacts/contracts/nft.sol/NFT.json'
import Market from '../artifacts/contracts/showcase.sol/Showcase.json'

//function calling items we have purchased ourselves 
export default function MyAssets() {
//couple pieces of local state- one for array of nfts one showing the loading state, call function
    const [nfts, setNfts] = useState([])
    const [loadingState, setLoadingState] = useState('not-loaded')
    useEffect(() => {
        loadNfts()
    }, [])
    async function loadNfts() {
        const web3Modal = new Web3Modal()
        const connection = await web3Modal.connect()
        const provider = new ethers.providers.Web3Provider(connection)
        const signer = provider.getSigner()
//using signer to get reference to the market contract in order to pass the msg., if we havent authenticated with a wollet metamask will show up, calling using json rpc provider
// fetch market items and map over them   
        const marketContract = new ethers.Contract(shawcaseaddress, Showcase.abi, signer)
        const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider)
        const data = await showcaseContract.fetchMyNFTs()
//get token metadata and update it
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
            }
            return item
        }))
        setNfts(items)
        setLoadingState('loaded')
    }
    //check if loading state is loaded without nfts
    if (loadingState === 'loaded' && !nfts.legth) return (
        <h1 className="py-10 px-20 text-3xl"></h1>
    )
    //return ui
    return(
      <div className="flex justify-center">
          <div className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
                  {
                      nfts.map((nft, i) => (
                          <div key={i} className="border shadow rounded-xl overflow-hidden">
                              <img src={nft.image} className="rounded" />
                              <div className="p-4 bg-black">
                                  <p className="text-2xl font-bold text-white">Price- {nft.price} Eth</p>
                                </div>
                            </div>
                      ) )
                  }
              </div>
          </div>
      </div>  
    )
}