import React, {useState, useEffect} from 'react'

const StockInfo = (props) => {

  const [infoFlag, setInfoFlag] = useState(false);

  const infoFlagChange = () => {setInfoFlag (! infoFlag)}

  const [infoStr, setInfoStr] = useState()


  useEffect(() => {
    var txt = ''
    const keys = Object.keys(props.stockInfo)
    keys.forEach (key => txt += key + ':   ' + props.stockInfo[key] +'\n')

     
    setInfoStr (txt);
  },[props.infoSymbol, props.stockInfo]) 


  return (
    <div>
      <div>
        <input
          type="checkbox" checked={infoFlag}
          onChange={infoFlagChange}
        /> StockInfoRaw
      </div>
      
      <div id="textarea_id"> 
      {infoFlag && infoStr &&
        <div>
          <div  style={{color: 'magenta' }}>  {props.infoSymbol} </div>
          <textarea type='text' name='stockInfo' cols='100' rows='20' readOnly
          value={infoStr}  >
          </textarea>
        </div>
      }
      </div>
    </div>
  )
}

export default StockInfo