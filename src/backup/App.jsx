import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from './assets/vite.svg'
// import heroImg from './assets/hero.png'
// import './App.css'
// import Student from './Student'

function App() {
 const[name,setName]=useState("")
 const[email,setEmail]=useState("")
 const[password,setPassword]=useState("")

  // const [count, setCount] = useState(0)
  //   const increment =()=>{
  //       setCount(count+1)
  //     }
  //     const decrement =()=>{
  //       setCount(count-1)
  //     }
  //     const reset =()=>{
  //       setCount(0)
  //     }


  return (
    <>
    
      <h1>Registration Form</h1>
      <input type="text" placeholder='Enter Your Name' value={name} onChange={(e)=>setName(e.target.value)}/> <br />
      <input type="text" placeholder='Enter Your Valid Email' /> <br />
      <input type="text" placeholder='Enter Your Password' />
      <h2>{name}</h2>
      
      {/* <h2>React Counter Application</h2>
      <h2>{count}</h2>
      <button onClick={increment}>Increment</button><br />
      <button onClick={decrement}>Decrement</button><br />
      <button onClick={reset}>Reset</button> */}
    
    




    {/* <div>
      <h1>Student Information</h1>
      <Student name= "Ram" course= "B.tech" marks="90"/> <br/>
      <Student name= "Raj" course= "M.tech" marks="95"/><br/>
      <Student name= "Rohan" course= "MCA" marks="92"/><br/>
      </div>
       */}

{/*     
      <div>
      <audio controls><source src='' type='audio/mp3' /></audio>
        <iframe
          width="560"
          height="315"
          src="https://www.youtube.com/embed/U-09GNHWmP0"
          title="YouTube video player"
          frameBorder="0"
          allowFullScreen
        ></iframe>
           <iframe
          width="560"
          height="315"
          src="https://www.youtube.com/embed/9JxCQUUhmBs"
          title="YouTube video player"
          frameBorder="0"
          allowFullScreen
        ></iframe>
        <br />
        <img
          src="https://images.pexels.com/photos/37182942/pexels-photo-37182942.jpeg"
          width="400"
          height="600"
        />

        <br />

        <button>Click me</button>

        <h1>Web page of ABES</h1>
        <h2>Hello</h2>
        <h2>Harshit Chahal</h2>
        <h1>Video player</h1>
        </div> */}
      
    </>
  )
}

export default App