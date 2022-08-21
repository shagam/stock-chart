import React, {useState} from 'react'
// import MobileContext from './MobileContext';


export const ServerSelect = (props) => {
  // props.setServ
  // props.defaultValue  missing
  // props.title
  // props.options

  const [serv, setServ] = useState (props.options[0])

  const LOG = false;

  function exec (s) {
    setServ (s);
    props.setServ (s);
    if (LOG)
      console.log('server:', s)
  }

  return (
    <div style={{display: 'flex'}}>
    {props.title} &nbsp;&nbsp;
    {props.options.map((servSel) => (
      <div key={servSel} >
        <input style={{zoom: '150%'}}  type='radio' name="radioValues" value={servSel} 
        checked={serv === servSel} onChange={(e) => exec (e.target.value)}  />
         <b>&nbsp;{servSel}&nbsp;&nbsp;</b> 
      </div>
    ))}
  </div>
  )
}

export default ServerSelect;