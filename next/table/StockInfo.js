"use client";
import React, {useState, useEffect} from 'react'
import { useShared } from '../contexts/SharedContext';


const StockInfo = (props) => {

    const {chartSymbol, setChartSymbol,
        infoSymbol, setInfoSymbol,
        // gainMap, setGainMap,
        chartData, setChartData,
        stockInfo, setStockInfo,
      } = useShared();
  

  const [infoFlag, setInfoFlag] = useState(false);

  const infoFlagChange = () => {setInfoFlag (! infoFlag)}
  function numberWithCommas(x) {
    const isIntegerString = (str) => /^-?\d+$/.test(str);
    if (! isIntegerString(x)) {
      return x; // Return the original value if it's not an integer string
    }
    x = x.toString();
    var pattern = /(-?\d+)(\d{3})/;
    while (pattern.test(x))
        x = x.replace(pattern, "$1,$2");
    return x;
  }

  function colorAttribute (attribute) {
    if (attribute === 'ForwardPE') {
      return 'magenta';
    }
    return 'ForestGreen';
  }

  function pageHeader ({symbol, route, description}) {
    return (
        <div>
        <div style = {{display: 'flex'}}>
          <div  style={{color: 'magenta' }}>  {chartSymbol} &nbsp; </div>
          <div  style={{color: 'blue' }}> infoRaw </div> 
        </div>

        <h4  style={{color:'#33ee33', fontWeight: 'bold', fontStyle: "italic"}}> &nbsp; Stock technical raw info. (etf not Supported)  &nbsp; </h4>
      </div>)       
  }
  

  return (
    <div style = {{ border: '2px solid blue', background: '#f0f0e0', padding: '5px', margin: '5px'}} >
      <div> 
      {/* {! stockInfo && <h6 style={{color: 'red'}}> No info (probably an ETF)  </h6>} */}
      
      {pageHeader (chartSymbol, 'infoRaw', 'Stock technical raw info. (etf not Supported)' )}
      
      {chartSymbol !== infoSymbol && <h6 style={{color: 'red'}}> No info, (An ETF or data for a previous symbol)  </h6>}

      {/* Table of symbol/stock attributes: value */}
      { stockInfo &&
        <div>
          <div style = {{display: 'flex'}}>
            <div  style={{color: 'magenta' }}>  {infoSymbol} </div> &nbsp; &nbsp; 
            <h4 style={{color: 'blue'}}> InfoRaw  </h4>
          </div>

          <div  style={{ maxHeight: '30vh', 'overflowY': 'scroll'}}  > 

          <table>
            <tbody> 
              {stockInfo && 
                Object.keys(stockInfo).map((infoName,i)=>{
                  return (
                      <tr  key={i}>
                        <td  style={{padding: '2px', margin: '2px'}}>{i}</td>
                        <td style={{padding: '2px', margin: '2px', color: colorAttribute(infoName), minWidth: '16rem', border: `none` }} > {infoName}: &nbsp;&nbsp; </td>
                        <td style={{padding: '2px', margin: '2px', border: `none`}} > 
                            <div>{numberWithCommas(stockInfo[infoName])} </div>
                          </td> 
                      </tr>
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

export {StockInfo, pageHeader}