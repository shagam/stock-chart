import React, {useState} from 'react';
import GetInt from '../utils/GetInt'
import AlphaVantage from '../AlphaVantage'

const  Config = (props) => { 

  const [configFlag, setConfigFlag] = useState (false);
  //console.log(`AlphaVantage localStorage ${alpha}`); 


  const configFlagChange = () => {setConfigFlag (! configFlag)}

  function purgeStockTable () {
    for (let index = props.rows.length -1; index >= 0; index--)
      props.rows.splice(index, 1);
    props.saveTable();
  }

  const style = {
    // background: 'blue',
    // color: 'red',
    // fontSize: 200,
    border: '2px solid blue'
  };
  //   
  return (
    <div style = {style}>
      <input
        type="checkbox" checked={configFlag}
        onChange={ configFlagChange }
      /> config 

      { configFlag &&
        <div id = "config_id">
          <AlphaVantage alphaCallBack={props.alphaCallBack} />
          <div> </div>
          <hr/> 
          <div> &nbsp; <button onClick={purgeStockTable} > Purge stock table </button> &nbsp; </div>
        </div>
      }

    </div>
  )
}

export default Config