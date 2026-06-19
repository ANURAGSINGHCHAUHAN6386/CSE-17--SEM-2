import Student from './components/Student'
import './App.css'

function App() {
  return (
    <div className="container">

      <h2>Student Information</h2>

      <Student 
        name="Rahul Sharma" 
        course="Computer Science" 
        marks="85" 
      />

      <Student 
        name="Anita Verma" 
        course="Information Technology" 
        marks="92" 
      />

      <Student 
        name="Rohan Gupta" 
        course="Electronics" 
        marks="78" 
      />
      <div className='Credit'>
        <p> Created By : ANURAG SINGH CHAUHAN</p>
      </div>
    </div>
  )
}

export default App