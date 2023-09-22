import React, {useState, useEffect} from 'react'

const StockInfo = (props) => {

  const [infoFlag, setInfoFlag] = useState(false);

  const infoFlagChange = () => {setInfoFlag (! infoFlag)}

  const [infoStr, setInfoStr] = useState()


  useEffect(() => {
    setInfoStr (props.stockInfo.split(",").join(',\n'));
  },[props.infoSymbol, props.stockInfo]) 


  return (
    <div>
      <div>
        <input
          type="checkbox" checked={infoFlag}
          onChange={infoFlagChange}
        /> StockInfo
      </div>
      
      <div id="textarea_id"> 
      {infoFlag && infoStr &&
        <div>
          <div  style={{color: 'magenta' }}>  {props.infoSymbol} </div>
          <textarea type='text' name='stockInfo' cols='80' rows='20' readOnly
          value={infoStr}  >
          </textarea>
        </div>
      }
      </div>
    </div>
  )
}

export default StockInfo