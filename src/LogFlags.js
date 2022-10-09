import React, {useState} from 'react'
// import "./logFlagaStyles.css";
// https://contactmentor.com/checkbox-list-react-js-example/

const LogFlags = (props) => {

  const [showFlags, setShowFlafs] = useState(false)
   // State with list of all checked item
   const [checked, setChecked] = useState([]);
   const checkList = ["drop", 'drop_', "firebase", "marketwatch", "splits", "chart", 'alpha','api', "aux"];
 
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
  //  const checkedItems = checked.length
  //    ? checked.reduce((total, item) => {
  //        return total + ", " + item;
  //      })
  //    : "";
 

   // Return classes based on whether item is checked
   var isChecked = (item) =>
     checked.includes(item) ? "checked-item" : "not-checked-item";
 
    var checkedItems_ = ''
    checkList.forEach (function (item) { 
      if (checked.includes(item)) {
        checkedItems_ === '' ? checkedItems_ += item : checkedItems_ += ", " + item
      }
    })  

   return (
     <div className="app" style={{ border: '2px solid magenta', padding: '0px'}}>
      <div>
        <input  type="checkbox" checked={showFlags}  onChange={() => {setShowFlafs(!showFlags)}} /> &nbsp; Console Log flags
      </div>

       <div className="checkList">

         <div className="list-container"  style={{display:'flex'}}>
           {showFlags && checkList.map((item, index) => (
             <div key={index}>
               <input value={item} type="checkbox" onChange={handleCheck} />
               <span className={isChecked(item)}>&nbsp;{item}&nbsp;&nbsp;</span>
             </div>
           ))}
         </div>
         <div className="title"> {checkedItems_}</div>
       </div>
     </div>
   );
 }
 

export default LogFlags