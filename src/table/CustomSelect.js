import React from 'react'
import Select from 'react-select'


// const selectStyle= {
//   width: '100%',
//   maxWidth: 600

// }

export function CustomSelect (props) {

  // function onChangeInput (value) {
  //   console.log (value)
  // }

  return (
    <div style={{display:'flex'}}>   
      <h4>{props.label}&nbsp;&nbsp;</h4>
      <div style={{ width:'250px'}}>
        <Select  options={props.options} onChange={props.onChange} defaultValue={props.defaultValue}/>
      </div>
    </div>
  )
}


export default CustomSelect;