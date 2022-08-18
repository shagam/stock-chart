import {useState} from 'react';

const InputNumber = (props) => {
  const LOG = false
  const [value, setValue] = useState(props.init);


  function submit () {
    props.setNumber(value)
    if (LOG)
    console.log(value);
  // console.log(typeof value);
  // console.log(Number(value));
  }

  return (
    <form onSubmit={submit} >
      <div  style={{display: 'flex'}} >
        <div>{props.title} &nbsp; &nbsp; </div>
        <input
          type="text"
          pattern="[\-]?[0-9]+"
          placeholder={props.title}
          value={value}
          onChange={(e)=>
            setValue((v) => e.target.validity.valid ? e.target.value : v)}
        />
        <button type="submit"> submit </button> 
      </div>

    </form>
  );
};

export default InputNumber;