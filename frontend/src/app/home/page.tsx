import React from 'react'
import Dashboard from '../components/data-dashboard'
import Footer from '../components/footer'
import { FloatingNavDemo } from '../components/navbar'

const page = () => {
  return (
    <><div><Dashboard/></div>
    <footer>
        <Footer/>
    </footer>
    <FloatingNavDemo/>
    </>
    
  )
}

export default page