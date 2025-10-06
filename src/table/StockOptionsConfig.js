
import React, { useEffect, useState, useMemo, useCallback } from 'react';
// import './App.css';
import '../alphaVantage.css'
import { ComboBoxSelect } from '../utils/ComboBoxSelect'


function StockOptionsConfig (props) { 
  if (props.logExtra)
    console.log(props.config)
  const [expirationCount, setExpirationCount] = useState(props.config.expirationCount);
  const [expirationNum, setExpirationNum] = useState(props.config.expirationNum);
  const [strikeCount, setStrikeCount] = useState(props.config.strikeCount);
  const [strikeNum, setStrikeNum] = useState(props.config.strikeNum);
  const  sideLIst = ['call', 'put'];
  const [side, setSide] = useState(props.config.side); // default to call options

  const [action, setAction] = useState(props.config.action); // highest gain or lowest gain
  const actionList = ['buy', 'sell'];

  const [compoundYield, setCompoundYield] = useState(props.config.compoundYield); // true - compound gain, false - simple gain
  const [percent, setPercent] = useState(props.config.percent); // true - percent, false - gain factor

  // const [alpha, setAlpha] = useState();
  
  var flexConfig = localStorage.getItem('stockOptionsConfig');


    const formChange = (event) => {
        event.preventDefault();
        const fieldName = event.target.getAttribute("name");
        const fieldValue = event.target.value;

        // console.log(event);
        console.log('alpha key change', event.target.name + " " + event.target.value.toUpperCase());
        // setAlpha (event.target.value.toUpperCase());
    }

    const formSubmit = (event) => {
        event.preventDefault();


      const newConfig = {expirationNum: Number(expirationNum), expirationCount: Number(expirationCount),
         strikeNum: Number(strikeNum), strikeCount: Number(strikeCount),
        side: side, percent: percent, compoundYield: compoundYield, action: action};

        if (props.logExtra)
          console.log("final data is: ", newConfig);
        props.setConfig (newConfig);
    }

    function clearKey () {
      // console.log("clear");
      localStorage.removeItem ('stockOptionsConfig');
      // setAlpha(null)
      // props.alphaCallBack(null)
    }

    //console.log('AlphaVantage render');

    return (
      <div style={{border:'2px solid magenta'}} className = 'alpha'>
        {/* <div style={{border:'2px solid blue'}}></div> */}
        {/* <div>&nbsp;</div> */}
        <h5  style={{color:'#33ee33', fontWeight: 'bold', fontStyle: "italic"}}>StockOptions config: </h5>
        <form onSubmit = {formSubmit}>

          <label> Days-to-expire: &nbsp;
            <input style={{width: '50px'}} type="number" name="expirationNum" // required="required"
              placeholder="expirationNum"  onChange={(e) => setExpirationNum(e.target.value)} value={expirationNum} />
          </label>&nbsp; &nbsp; 

          <label> ExpirationCount &nbsp;
            <input style={{width: '50px'}} type="number" name="expirationCount" // required="required"
              placeholder="expirationCount"  onChange={(e) => setExpirationCount(e.target.value)} value={expirationCount} />
          </label>&nbsp; &nbsp; 



          <br/>          <br/>
          <label> Strike-%-AbovePrice: &nbsp;
            <input style={{width: '50px'}} type="number" name="strikeNum" // required="required"
              placeholder="strikeNum"  onChange={(e) => setStrikeNum(e.target.value)} value={strikeNum} />
          </label>&nbsp; &nbsp; 

          <label> StrikeCount &nbsp;
            <input style={{width: '50px'}} type="number" name="strikeCount" // required="required"
              placeholder="strikeCount"  onChange={(e) => setStrikeCount(e.target.value)} value={strikeCount} />
          </label>&nbsp; &nbsp; 


          <br/>          <br/>
        <div style = {{display: 'flex'}}>
          <ComboBoxSelect serv={side} nameList={sideLIst} setSelect={setSide} title='side=' options={sideLIst} defaultValue={side}/> &nbsp; &nbsp;  &nbsp; 
          <ComboBoxSelect serv={action} nameList={actionList} setSelect={setAction} title='action=' options={actionList} defaultValue={action}/> &nbsp; &nbsp;  &nbsp; 
          <div style = {{display: 'flex'}}> <input type="checkbox" checked={percent}  onChange={()=>setPercent (! percent)}  />&nbsp;% &nbsp; (or yield-factor) &nbsp; &nbsp; &nbsp; </div>
          <div style = {{display: 'flex'}}> <input type="checkbox" checked={compoundYield}  onChange={()=>setCompoundYield (! compoundYield)} />&nbsp;compound-yield &nbsp; &nbsp; </div> &nbsp; &nbsp;
        </div>

        <label>YearlyGain: &nbsp;
          <input style={{width: '100px'}} type="number" name="YearlyGain" // required="required"
            placeholder="YearlyGain" step="any" onChange={(e) =>  props.setEstimatedYearlyGain(e.target.value)} value={props.estimatedYearlyGain} />
        </label>&nbsp; &nbsp; 


        <div>&nbsp;</div>
          {/* <br/>          <br/> */}
          <button  style={{background: 'aqua'}} type="submit"> save-config</button> 
        </form>
        
        <div>&nbsp;</div> 
          {/* <div>&nbsp;</div> */}
        {/* &nbsp;&nbsp;key: ({alpha}) */}
        {/* &nbsp; <button type="button" onClick={()=>clearKey()}>Clear  </button>  */}

      </div>
    )
}

export default  StockOptionsConfig    