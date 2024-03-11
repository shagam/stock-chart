import React, {useState, useMemo, useEffect} from 'react'
import { Link, useNavigate } from 'react-router-dom'

// import "./logFlagaStyles.css";
// https://contactmentor.com/checkbox-list-react-js-example/

const LogFlags = (props) => {

  const [showFlags, setShowFlafs] = useState(false)
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
 
    function showToggle () {
      setShowFlafs(!showFlags)
      props.setLogFlags(checked)
    }

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
            {props.checkList.map((item, index) => (
              <div style={{display:'flex'}} key={index}>
                <input value={item} type="checkbox" checked={checked.includes(item)} onChange={handleCheck} />
                <span>&nbsp;{item}&nbsp;&nbsp;</span>
              </div>
            ))}
          </div>
          {/* <div className="title"> {checkedItems}</div> */}
        </div>
      </div>
    );
  }
  
 
 export default LogFlags
   