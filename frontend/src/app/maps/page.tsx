import React from 'react'
import GoogleMaps3D from '../components/Google3d'
import Footer from '../components/footer'
import { FloatingNavDemo } from '../components/navbar'


const page = () => {
  return (
    <>
    <FloatingNavDemo/>
    <div>
        <input type='search'></input>
    </div>
    <div className='flex flex-col pt-20 w-full pb-20 items-center justify-center '>
    <GoogleMaps3D/>
    </div>

    <footer>
    <Footer/>
    </footer>
    
    
    </>
  )
}

export default page