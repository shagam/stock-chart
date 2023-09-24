import React, {useState} from 'react';


function spikesGet (symbol, stockChartXValues, stockChartYValues, logFlags) {
    if (! symbol) {
      alert ("Missing symbol, press gain for a symbol")
      return;
    }
    var spikes = [];


    for (let i = 0; i <  stockChartYValues.length - 2; i++) {

    const ratio = Number (stockChartYValues[i+1] / stockChartYValues[i]);
    const ratio_1 = Number (stockChartYValues[i+1] / stockChartYValues[i+2]);

    if (ratio > 1.7 && ratio_1 > 1.7) {
      const info = {
        date: stockChartXValues[i],
        jump: ratio.toFixed(2),
        jump_back: (1/ratio_1).toFixed(2),
        index: i,
        // y: props.stockChartYValues[i],
        // y1: props.stockChartYValues[i+1],
        // y2: props.stockChartYValues[i+2],
      }

      // if (spikes.length === 0)
      //   spikes.push(props.symbol)
      spikes.push (info)

      // if (info.jump > 1)
      //   console.log ('%c' + JSON.stringify(info), 'background: #fff; color: #22ff11')
      // else
      //   console.log ('%c' + JSON.stringify(info), 'background: #fff; color: #ee1122')
    }
  }
  if (logFlags.includes('spikes') && spikes.length > 0) {
    console.log ('spikes:', spikes)
  }
  return spikes;
}

function spikesSmooth (sym, stockChartXValues, stockChartYValues, logFlags) {
    for (let i = 0; i <  stockChartYValues.length - 2; i++) {
        const ratio = Number (stockChartYValues[i+1] / stockChartYValues[i]);
        const ratio_1 = Number (stockChartYValues[i+1] / stockChartYValues[i+2]);
    
        if (ratio > 1.7 && ratio_1 > 1.7) {
            stockChartYValues[i+1] = (stockChartYValues[i] + stockChartYValues[i + 2]) / 2;
            const info = {
                symbol: sym,
                date: stockChartXValues[i],
                jump: ratio.toFixed(2),
                jump_back: (1/ratio_1).toFixed(2),
                index: i,
            }
            
            if (logFlags.includes ('spikes'))
                console.log ('spike smoothed:',  info)
        }
    }
     
}

export {spikesSmooth, spikesGet}