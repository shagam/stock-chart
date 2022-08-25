import React, {useState} from 'react';

function GetInt (props) {

  // props.init 
  // props.callBack
  // props.title
  // props.pattern "[\-]?[0-9]+"

const [int, setInt] = useState(props.init);

const flexSubmit = (event) => {
  event.preventDefault();
  console.log ('int:', int)
  props.callBack (int);
}

return (
<div id = "config_id">

  <form  style={{display:'flex'}} onSubmit = {flexSubmit}>
    <div> {props.title}&nbsp; </div>
    <input  style={{ 'width': '6vw'}}
      type="number"
      pattern={props.pattern}
      name={props.title}
      required="required"
      // defaultValue={Number(int)}
      placeholder={props.init}
      onChange={(e)=>
        setInt ((v) => e.target.validity.valid ? e.target.value : v)}
    />
    <button type="submit"> Enter</button>
  </form>

</div>
)}


export default GetInt