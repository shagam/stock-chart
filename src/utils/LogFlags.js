import React, {useState, useMemo, useEffect} from 'react'
import { Link, useNavigate } from 'react-router-dom'

// import "./logFlagaStyles.css";
// https://contactmentor.com/checkbox-list-react-js-example/

//** Flags defined in app.js */

const LogFlags = (props) => {

  const flags0 = []
  const flags1 = []
  const flags2 = []

  var cnt = 0;
  // React.useEffect (() => {
 
  // }, [props.checkList])

  props.checkList.forEach((f) => {
    if (cnt < 7)
      flags0.push(f)
    else if (cnt < 15)
      flags1.push(f)
    else
      flags2.push(f)
    cnt++;
  })


   // State with list of all checked item
   var logFlagsRaw = localStorage.getItem('logFlags')
   if (! logFlagsRaw)
    logFlagsRaw = "[]";
   const [checked, setChecked] = useState(JSON.parse(logFlagsRaw));
   

   // Add/Remove checked item from list
   const handleCheck = (event) => {
     var updatedList = [...checked];
     if (event.target.checked) {
       if (! checked.includes(event.target.value))
       updatedList = [...checked, event.target.value];
     } else {
       updatedList.splice(checked.indexOf(event.target.value), 1);
     }
     setChecked(updatedList);
     props.setLogFlags(updatedList)
     localStorage.setItem('logFlags', JSON.stringify(updatedList));
   };
 
   // Generate string of checked items
   const checkedItems = checked.length
     ? checked.reduce((total, item) => {
         return total + ", " + item;
       })
     : "";
 

   // Return classes based on whether item is checked

   var isChecked = (item) =>
     checked.includes(item) ? "checked-item" : "not-checked-item";
 
    return (
      <div style={{ border: '2px solid magenta', padding: '0px'}}>
        <hr/> 
        <div>
            <Link to="/" > Home </Link>
        </div>

        <hr/> 
        <h4 style={{color:'Green'}}>Console.log flags  </h4>
        <hr/> 
        
        <div>
          <div style={{display:'flex'}}>
            {flags0.map((item, index) => (
              <div style={{display:'flex'}} key={index}>
                <input value={item} type="checkbox" checked={checked.includes(item)} onChange={handleCheck} />
                <span>&nbsp;{item}&nbsp;&nbsp;</span>
              </div>
            ))}
          </div>
          <br></br>
          <div style={{display:'flex'}}>
            {flags1.map((item, index) => (
              <div style={{display:'flex'}} key={index}>
                <input value={item} type="checkbox" checked={checked.includes(item)} onChange={handleCheck} />
                <span>&nbsp;{item}&nbsp;&nbsp;</span>
              </div>
            ))}
          </div>
          <br></br>
          <div style={{display:'flex'}}>
            {flags2.map((item, index) => (
              <div style={{display:'flex'}} key={index}>
                <input value={item} type="checkbox" checked={checked.includes(item)} onChange={handleCheck} />
                <span>&nbsp;{item}&nbsp;&nbsp;</span>
              </div>
            ))}
          </div>
          <br></br>
          {/* <div className="title"> {checkedItems}</div> */}
        </div>
      </div>
    );
  }
  
 
 export default LogFlags
   