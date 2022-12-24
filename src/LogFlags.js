import React, {useState, useEffect} from 'react'
// import "./logFlagaStyles.css";
// https://contactmentor.com/checkbox-list-react-js-example/

const LogFlags = (props) => {

  const [showFlags, setShowFlafs] = useState(false)
   // State with list of all checked item
   const [checked, setChecked] = useState([]);
   const checkList = ["drop", 'drop_', 'peak2Peak', "firebase", "marketwatch", "splits", "chart", 'alpha','api', "aux"];
 
   
  useEffect(() => {
    const flags = JSON.parse(localStorage.getItem('logFlags')) 
     if (flags)
        setChecked(flags)
  }, []);



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
<<<<<<< HEAD
  //  var isChecked = (item) =>
  //    checked.includes(item) ? "checked-item" : "not-checked-item";
=======
   var isChecked = (item) =>
     checked.includes(item) ? "checked-item" : "not-checked-item";
>>>>>>> 7b4e35ce732fd4e7c909354c72c9b91ebacd3e76
 
    // var checkedItems_ = ''
    // checkList.forEach (function (item) { 
    //   if (checked.includes(item)) {
    //     checkedItems_ === '' ? checkedItems_ += item : checkedItems_ += ", " + item
    //   }
    // })  

   return (
     <div className="app" style={{ border: '2px solid magenta', padding: '0px'}}>
      <div>
        <input  type="checkbox" checked={showFlags}  onChange={() => {setShowFlafs(!showFlags)}} /> &nbsp; Console Log flags
      </div>

       <div className="checkList">

         <div className="list-container"  style={{display:'flex'}}>
           {showFlags && checkList.map((item, index) => (
             <div key={index}>
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