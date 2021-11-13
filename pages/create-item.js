import { useState } from "react"
import { ethers } from "ethers"
import {create  as ipfsHttpClient } from 'ipfs-http-client'
//allows us to read the values from the rauter
import { useRouter } from 'next/router'
import Web3Modal from 'web3modal'

//use infura pinning service
const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0')

import {
    nftaddress, showcaseaddress
} from '../config'

import NFT from '../artifacts/contracts/nft.sol/NFT.json'
import Market from '../artifacts/contracts/showcase.sol/Showcase.json'
import { createSemicolonClassElement } from "typescript"

export default function CreateItem () {
  //create a couple of pieces of local state, first one is the file url, the ipfs file we allow the user to upload, the second lcoal state for form input - alllows to upload a file, to set the price, the name. rATHER THAN PASSING A STRING WE PASS AN object
  const [fileUrl, setFileUrl] = useState(null)
  const [formInput, updateFormInput] = useState({name: '', description: ''}) 
  //const [formInput, updateFormInput] = useState({price: '', name: '', description: ''})  
  const router = useRouter()

  //first function is for creating and updating the file url, form input. Invoked with an event, event that targets file arrays, containing one item
  async function onChange(e) {
      const file = e.target.files[0]
      try {
//upload file to ipfs
//could also do progress callback, progress of the files
        const added = await client.add (
            file,
            {
                progress: (prog) => console.log(`received: ${prog}`)
            }
        )
        //using variable we can set url, call same url
        const url = `https://ipfs.infura.io/ipfs/${added.path}`
        setFileUrl(url)
      } catch (e) {
          console.log(e)
      }
  }
  // functions that allow users to list their items to sale, not only do we have the reference locally but also the representation of the nft, name and description, name description and image
  //one for creating item and saving it to ipfs, first we get values from the description
  
  async function createItem() {
      const { name, description, price} = formInput
      // basic form validation, if there is not name or description, price , no file url = return
      if (!name || !description || !price || !fileUrl) return 
      const data = JSON.stringify({
          name, description, image:fileUrl
      })

      //save value to ipfs using the same thing : calling client .add const add client data and set a value called url, ipfs path that return name, descriptoion and image
      try{
          const added = await client.add(data)
          const url = `https://ipfs.infura.io/ipfs/${added.path}`
          //after file is uploaded on ipfs, pass the url to saave it to polygon SET URL AS TOKEN URL
          createSale(url)
      } catch (error) {
          console.log('Error uploading', error)
      }

  }

  //another one creating the listing, listing item for sle but also creating nft in the same function, two things going on
  async function createSale(url) {
      //call a reference to web3 modal that connect, get provider, signer
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()

    // only interacting with two contracts, first interact with nft contract by creating a reference to it
    let contract = new ethers.Contract(nftaddress, NFT.abi, signer)
    //call create token
    let transaction = await contract.createToken(url)
    let tx = await transaction.wait()
    //you cant just wait for retun value, have to do some evaluation 
// within arrays there is another array there is args( also array, the thirf value), and that value is turned into a number, reference to tokenID

    let event = tx.events[0]
    let value = event.args[2]
    let tokenId = value.toNumber()

    //get reference to the price , turning that one basic number to the very large number
    const price = ethers.utils.parseUnits(formInput.price, 'ether')

    contract = new ethers.Contract(showcaseaddress, Market.abi, signer)
    //move reference of the contract being the nft to now creating a reference to the nft market address and market contract
    //change contract variable being referred to nft market contract, get listing price
    let listingPrice = await contract.getListingPrice()
    listingPrice = listingPrice.toString()
    //turning it to string to be able ot send the value within this transaction, to the contract to make sure we are paying for that listing fee (incentive), wait for the contract that creates market adddress to succeed, passing all market value to suceeed passing the nft address , tokenId.. price, putting this item for salesetting the token id as the price and the value that will be extracted from out wallet
    transaction = await contract.createMarketItem(
        nftaddress, tokenId, price, { value: listingPrice }
    )
    await transaction.wait()
    //now we reroute the user to another page, sending them back to the front page and refetch the nfts
    router.push('/')
}
//form to allow the user to interact with our functions, have inputs for nft name calling the placeholder update form input
//update form will return all existing forms
//description uses a text area
//third one setting the price
// last one showing the file input, instead of using input wiht on chain handler, we will define it by on change and set the type of input to be file, want to have a button to allow the user to create the digital asset
//last: show preview of the file, if there is a url we want to show an image
//            <input
//placeholder="Asset Price in Eth"
//className="mt-2 border rounded p-4"
//onChange={e => updateFormInput({...formInput, price: e.target.value})}
///>
return(
    <div className="flex justify-center">
        <div className="w-1/2 flex flex-col pb-12">
          <input
            placeholder="Asset Name"
            className="mt-8 border rounded p-4"
            onChange={e => updateFormInput({ ...formInput, name: e.target.value})}
            />
            <textarea
                placeholder="Asset description"
                className="mt-2 border rounded p-4"
                onChange={e => updateFormInput({...formInput, description: e.target.value})}
            />
            <input
            type="file"
            name="Asset"
            className="my-4"
            onChange={onChange}
            />
            {
                fileUrl &&
                <img className="rounded mt-4" width="350" src={fileUrl} />
            }

            <button onClick={createItem} 
            className= "font-bold mt-4 bg-purple-500 text-white rounded p-4 shadow-lg"
            >
            Create Binding Opinion
            </button>
        </div>  
    </div>
)

}
