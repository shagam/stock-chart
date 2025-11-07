import React, {useState} from 'react';

function GetInt (props) {

  // props.init 
  // props.callBack
  // props.title
  // props.pattern "[\-]?[0-9]+"
  // props.required = true;

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
    <input  style={{ 'width': props.width}}
      type={props.type}
      pattern={props.pattern}
      name={props.title}
      required={props.required}//"required"
      // defaultValue={Number(int)}
      placeholder={props.init}
      onChange={(e)=>
        setInt ((v) => e.target.validity.valid ? e.target.value : v)}
    />
    <button  style={{width: '60px', background: '#f2ed8f'}} type="submit"> Enter</button>
  </form>

</div>
)}


export default GetInt