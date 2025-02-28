import Image from "next/image";
import { TypewriterEffect } from "./components/ui/typewriter-effect";
import { TimelineCarbon } from "./components/catlog";

import KeralaForestVisualization from "./components/keralavisualisation";
import Treeloss from "./components/Treeloss";
import { BackgroundBoxes } from "./components/Backgroundbox";
import GoogleMaps3D from "./components/Google3d";
import Link from "next/link";
import Footer from "./components/footer";
import { FloatingNavDemo } from "./components/navbar";


export default function Home() {
  const words=[{
    text:'Carbon',
  },{
    text:" Emissions ",
  },{
    text:" and ",
  },{
    text:" Tree ",
  },{
    text:" cover ",
  },{
    text:" loss ",
  }]
  const content= ['emission','treeloss']
  return (
    <>
    <FloatingNavDemo/>
      <main className="flex justify-center items-center ">
      <div className="flex flex-col items-center justify-center h-[40rem] ">
     <BackgroundBoxes/>
     
      <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 space-x-0 md:space-x-4 mt-10">
      </div>
      
    </div>
      </main>
      <div>
      <TimelineCarbon/>
      </div>
     
     
      <footer>
    <Footer/>
    </footer>
    </>
  );
}
