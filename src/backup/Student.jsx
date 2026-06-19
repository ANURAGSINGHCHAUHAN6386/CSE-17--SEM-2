import React from 'react'

function Student(props) {
  return (
    <div class="Student-info">
      <h2>Name: {props.name}</h2>
      <p>Course:{props.course}</p>
       <p>Marks:{props.marks}</p>
       </div>
  )
}

export default Student
