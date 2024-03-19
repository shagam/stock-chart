import React, {useState} from 'react'
// import MobileContext from './MobileContext';


export const ServerSelect = (props) => {
  // props.setServ
  // props.defaultValue  missing
  // props.title
  // props.options



  const LOG = false;


  return (
    <div style={{display: 'flex'}}>
    {props.title} &nbsp;

    <select   value={props.servSelect}  onChange={(e) =>{
      props.setServSelect (e.target.value)}} >
      {props.options.map((s, i) => (
          <option key={i} value={s} > {s} &nbsp; </option> 
      ))}  
    </select>

    {/* {props.options.map((servSel) => (
      <div key={servSel} >
        <input style={{zoom: '150%'}}  type='radio' name="radioValues" value={servSel} 
        checked={serv === servSel} onChange={(e) => exec (e.target.value)}  />
         <b>&nbsp;{servSel}&nbsp;&nbsp;</b> 
      </div>
    ))} */}
  </div>
  )
}

export default ServerSelect;