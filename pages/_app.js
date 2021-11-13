import '../styles/globals.css'
import Link from 'next/link'

function MyApp({ Component, pageProps}) {
  //div to allow navigation
  return (
    //first tailwind code 
    <div> 
      <nav className="border-b p-6">
        <p className="test-4xl font-bold"> File Restitution Archive</p>
        <div className="flex mt-4">
          <Link href="/"> 
            <a className="mr-4 text-purple-500">
              Home
            </a>
          </Link>
          <Link href= "/create-item">
            <a className="mr-4 text-purple-500">
              Opinions
            </a>
          </Link>
          <Link href= "/my-assets">
            <a className="mr-4 text-purple-500">
              Collections
            </a>
          </Link>
          <Link href= "/creator-dashboard">
            <a className="mr-4 text-purple-500">
              Claimed items 
            </a>
          </Link>
        </div>
      </nav>
        <Component{...pageProps} />

    </div>
  ) 
}

export default MyApp