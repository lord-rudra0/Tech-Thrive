import React from 'react'
import Dashboard from './components/data-dashboard'
import Footer from './components/footer'
import { FloatingNavDemo } from './components/navbar'
import FloatingChatbot from './components/Chatbot'



export default function page () {
  return (
    <><div><Dashboard/></div>
    <footer>
        <Footer/>
    </footer>
    <FloatingNavDemo/>
    <div>
    <FloatingChatbot/>
    </div>
    </>
    
  )
}
