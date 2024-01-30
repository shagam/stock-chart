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
        
          <div  style={{ maxHeight: '30vh', 'overflowY': 'scroll'}}  > 

          {props.stockInfo && Object.keys(props.stockInfo).map((infoName,i)=>{
            return (
                <div style={{display: 'flex'}} key={i}>
                  <div style={{'color': 'ForestGreen', minWidth: '20vw'}} > {infoName}: &nbsp;&nbsp; </div>
                  <div > {props.stockInfo[infoName]} </div> 
                </div>
              )
          })}
                  </div>



        </div>
      }
      </div>
    </div>
  )
}

export default StockInfo