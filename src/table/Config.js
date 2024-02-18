import React, {useState} from 'react';
import GetInt from '../utils/GetInt'
import AlphaVantage from '../AlphaVantage'
import { Link, useNavigate } from 'react-router-dom'

const  Config = (props) => { 

  const [configFlag, setConfigFlag] = useState (false);
  //console.log(`AlphaVantage localStorage ${alpha}`); 


  const configFlagChange = () => {setConfigFlag (! configFlag)}

  function purgeStockTable () {
    for (let index = props.rows.length -1; index >= 0; index--)
      props.rows.splice(index, 1);
    props.saveTable();
  }

  function reloadPage() {
    window.location.reload(false);
  }

  function columnsHiddenPurge() {
    localStorage.removeItem('columnsHidden')
    reloadPage()
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
          <div>  &nbsp; <Link to="/dashboard" > Login Dashboard </Link>  </div>
          <div  style={{display:'flex', paddingTop: '5px'}}>
             <div> &nbsp; <button onClick={purgeStockTable} > Purge stock table </button> &nbsp; </div>
            <div> &nbsp; <button onClick={columnsHiddenPurge} > Default Hidden columns </button> &nbsp; </div>
            {/* <div> &nbsp; <button onClick={reloadPage} > Reload page </button> &nbsp; </div> */}
            <div> &nbsp; <button onClick={props.refreshByToggleColumns} > Refresh table </button> &nbsp;&nbsp; </div>
            <button style={{height: '30px'}} type="button" className="stock_button_class" onClick={()=>props.saveTable()}>saveTable &nbsp;   </button>
          </div>
 
          {/* <div> &nbsp; </div>  */}
          {/* <hr/> */}
          <div  style={{display:'flex', paddingTop: '5px'}}>            
            <div style={{display:'flex'}}> &nbsp; &nbsp; <input  type="checkbox" checked={props.smoothSpikes} 
              onChange={() => props.setSmoothSpikes(! props.smoothSpikes)} />  &nbsp;smoothSpikes  &nbsp;  </div>
            
            <div style={{display:'flex'}}>  &nbsp; <input  type="checkbox" checked={props.openMarketFlag}
              onChange={() => props.setOpenMaretFlag(! props.openMarketFlag,)} />  &nbsp;OpenMarket </div>
          </div>
          
          <AlphaVantage alphaCallBack={props.alphaCallBack} />
          <div> </div>

        </div>
      }

    </div>
  )
}

export default Config