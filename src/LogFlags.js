import React, {useState} from 'react'
// import "./logFlagaStyles.css";
// https://contactmentor.com/checkbox-list-react-js-example/

const LogFlags = (props) => {

  const [showFlags, setShowFlafs] = useState(false)
   // State with list of all checked item
   const [checked, setChecked] = useState([]);
   const checkList = ["drop", "Banana", "Tea", "Coffee", "Apple_", "Banana_", "Tea_", "Coffee_"];
 
   // Add/Remove checked item from list
   const handleCheck = (event) => {
     var updatedList = [...checked];
     if (event.target.checked) {
       updatedList = [...checked, event.target.value];
     } else {
       updatedList.splice(checked.indexOf(event.target.value), 1);
     }
     setChecked(updatedList);
     props.setLogFlags(updatedList)
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
     <div className="app">
      <div>
        <input  type="checkbox" checked={showFlags}  onChange={() => {setShowFlafs(!showFlags)}} /> Log flags
      </div>

       <div className="checkList">
         <div className="title"> {checkedItems}</div>
         <div className="list-container"  style={{display:'flex'}}>
           {showFlags && checkList.map((item, index) => (
             <div key={index}>
               <input value={item} type="checkbox" onChange={handleCheck} />
               <span className={isChecked(item)}>&nbsp;{item}&nbsp;&nbsp;</span>
             </div>
           ))}
         </div>
       </div>
     </div>
   );
 }
 

export default LogFlags