import React, {useState} from 'react';


const  Config = (props) => { 
  var config_ = localStorage.getItem('flex');
  const [flex, setFlex] = useState(config_);
  const [configFlag, setConfigFlag] = useState (false);
  //console.log(`AlphaVantage localStorage ${alpha}`); 

  const flexChange = (event) => {
      event.preventDefault();
      console.log (event.target.name + " " + event.target.value);
      if (event.target.value < 1 || event.target.value > 1040)
        alert ('invalid flex: ', event.target.value);
      setFlex (event.target.value);
  }

  const flexSubmit = (event) => {
      event.preventDefault();
      localStorage.setItem('flex', `${flex}`);
      props.flexCallBack (flex);
  }

  const configFlagChange = () => {setConfigFlag (! configFlag)}

  return (
    <div>

      <input
        type="checkbox" checked={configFlag}
        onChange={ configFlagChange }
      /> config 

      { configFlag &&
        <form onSubmit = {flexSubmit}>
          <input
            type="number"
            name="flex"
            required="required"
            placeholder="flex week  1 - 1140"
            onChange={flexChange}
          />
          <button type="submit"> Enter</button>
        </form>
      }
    </div>
  )
}

export default Config