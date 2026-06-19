function Student(props) {
  return (
    <div className="card">
      <h3>{props.name}</h3>
      <p>Course: {props.course}</p>
      <p>Marks: {props.marks}</p>

      </div>
    
  )
}

export default Student