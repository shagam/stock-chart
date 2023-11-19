import React, {useState} from 'react'

const StockInfo = (props) => {

  const [gainFlag, setGainFlag] = useState(false);

  const gainFlagChange = () => {setGainFlag (! gainFlag)}


  return (
    <div>
      <div>
        <input
          type="checkbox" checked={gainFlag}
          onChange={gainFlagChange}
        /> StockGainRaw
      </div>
      
      <div id="textarea_id"> 
      {gainFlag && props.stockGain &&
        <div>
          <div  style={{color: 'magenta' }}>  {props.infoSymbol} </div>
          <textarea type='text' name='stockInfo' cols='85' rows='15' readOnly
            value={props.stockGain}  >
          </textarea>
        </div>
      }
      </div>
    </div>
  )
}

export default StockInfo