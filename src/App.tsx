import { useState } from 'react'
import "@/assets/css/index.css"
import DropzoneWidget from "./DropzoneWidget"

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className='w-full h-screen flex justify-center items-center'>
      <div className='w-[600px] h-96'>
        <DropzoneWidget accessKey="opcvSIZXPR51pO_LxjvZo" isPassword={false} />
      </div>
    </div>
  )
}

export default App
