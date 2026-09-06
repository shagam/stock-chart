import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';

import GetInt from '../utils/GetInt'

import {todayDate, getDate_YYYY_mm_dd__, getDate} from '../utils/Date';
import {beep2} from '../utils/ErrorList'

const API_KEY = process.env.REACT_APP_ALPHAVANTAGE_KEY

function SymSearch() {
    const [searchText, setSearchText] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [keys, setKeys] = useState([])

    function searchSymbols (searchStr) {
        if (!searchStr || searchStr.length < 1) {
            return []
        }


        const url =
        'https://www.alphavantage.co/query?function=SYMBOL_SEARCH' +
        `&keywords=${searchText}&apikey=${API_KEY}`;
        const miliStart =  Date.now()

        axios.get (url)
          // getDate()
          .then ((result) => {
            if (result.status !== 200)
              return;
            const miliEnd =  Date.now()
            // const parsedList = JSON.parse(result.data)
            // console.log (getDate() +  ' msg sent')
            const latency = miliEnd - miliStart

            setSearchResults(result.data)
            setKeys(Object.keys(result.data.bestMatches[0]))

            console.log (getDate(), 'sym search', searchStr, result.data, latency)
         
          })
          .catch ((err) => {
          // setError([sym, 'email', err.message, corsUrl])
            console.log(getDate(), 'contact', err, url)
          })     
        };



        // const response = await fetch(url);
        // const data = await response.json();

        // console.log(data.bestMatches);

        const ROW_SPACING = {padding: "5px 5px 2px 8px", margin: '0px'}

    return (
        <div  style = {{ border: '2px solid green', backgroundColor: '#f0f0f0', padding: '5px', margin: '5px'}} >
            <h6 style={{color: 'blue'}}> symbol search (AlphaVantage) &nbsp;  </h6>
            <h6  style={{color:'#33ee33', fontWeight: 'bold', fontStyle: "italic"}}> &nbsp;Search pattern (symbol) in AlphaVantage repository  &nbsp; </h6>


            <div style={{display: 'flex', alignItems: 'left'}}>
                <GetInt init={searchText} callBack={setSearchText} title='pattern  &nbsp;' type='text' pattern="[0-9_a-zA-Z\\.]+" width = '25%'/>
                <button style={{background: 'aqua'}} onClick={() => searchSymbols(searchText)}> sym search</button>&nbsp;
            </div>


            <hr/> 

            {keys.length > 0 && <div style={{maxHeight:'500px', maxWidth: '1400px', overflow:'auto'}}>
            <table>
                <thead>
                  <tr style={ROW_SPACING}>
                    <th style={{...ROW_SPACING, width: '20px'}}> N</th>
                    {keys.map((key, keyI) => {
                      return (
                        <th style={ROW_SPACING} title={searchResults[key]} key={keyI}>{key}</th>
                      )
                    })}
                  </tr> 
                </thead>
                  
                  {/* top, right, bottom, left */} 

                <tbody>
                  {searchResults.bestMatches.map((quote, index) => {
                    return (
                    ( 
                      <tr key={index} style={ROW_SPACING} >
                      <td style={{...ROW_SPACING, width: '20px'}}> {index}</td>
                      {keys.map((key, keyI) => {
                      return (
                        <td style={{...ROW_SPACING, width: '20px'}} key={keyI}> 
                        {(searchResults.bestMatches[index][key])}</td>
                      )
                    })}

                    </tr>
                    )
                  )})}
                </tbody>
            </table>
          </div>}


            {/* <pre>{JSON.stringify(searchResults, null, 2)}</pre> */}
        </div>
    )

}


export {SymSearch }



