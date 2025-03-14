import React, {useState} from 'react'
// import MobileContext from './MobileContext';


export const ComboBoxSelect = (props) => {
  // props.setServ
  // props.defaultValue  missing
  // props.title
  // props.options
  // props.names  


  function forceBoolean (val) {
    if (val === 'true') return true;
    if (val === 'false') return false;
    return val;
  }

  const LOG = false;


  return (
    <div style={{display: 'flex', height: '28px'}} >
    {props.title}&nbsp;

    <select title={props.TITLE}  value={props.serv}  onChange={(e) =>{
      props.setSelect (forceBoolean(e.target.value))}} >
      {props.options.map((s, i) => (
          <option key={i} value={s} > {props.nameList[i]} </option> 
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

export default ComboBoxSelect;