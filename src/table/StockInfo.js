import React, {useState, useEffect} from 'react'

const StockInfo = (props) => {

  const [infoFlag, setInfoFlag] = useState(false);

  const infoFlagChange = () => {setInfoFlag (! infoFlag)}



  return (
    <div>
      <div>  &nbsp; &nbsp; &nbsp;
        <input
          type="checkbox" checked={infoFlag}
          onChange={infoFlagChange}
        /> StockInfoRaw
      </div>
      
      <div id="textarea_id"> 
      {infoFlag && props.stockInfo &&
        <div>
          <div  style={{color: 'magenta' }}>  {props.infoSymbol} </div>
        
          <div  style={{ maxHeight: '30vh', 'overflowY': 'scroll'}}  > 

          <table>
            <tbody> 
              {props.stockInfo && 
                Object.keys(props.stockInfo).map((infoName,i)=>{
                  return (
                    <div  key={i}>
                      <tr>
                        <td style={{'color': 'ForestGreen', minWidth: '14rem', border: `none` }} > {infoName}: &nbsp;&nbsp; </td>
                        <td style={{ border: `none`}} > {props.stockInfo[infoName]} </td> 
                      </tr>
                    </div>
                  )
                })
              }
            </tbody>  
          </table>

          <br></br>
          </div>

        </div>
      }
      </div>
    </div>
  )
}

export default StockInfo