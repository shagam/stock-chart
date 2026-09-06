import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';

import GetInt from '../utils/GetInt'

import {todayDate, getDate_YYYY_mm_dd__, getDate} from '../utils/Date';
import {beep2} from '../utils/ErrorList'

const API_KEY = process.env.REACT_APP_ALPHAVANTAGE_KEY

function SymSearch() {
    const [searchText, setSearchText] = useState('');
    const [searchResults, setSearchResults] = useState([]);

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



    return (
        <div  style = {{ border: '2px solid green', backgroundColor: '#f0f0f0', padding: '5px', margin: '5px'}} >
            <h6 style={{color: 'blue'}}> symbol search (AlphaVantage) &nbsp;  </h6>
            <h6  style={{color:'#33ee33', fontWeight: 'bold', fontStyle: "italic"}}> &nbsp;Search pattern for symbol  &nbsp; </h6>


            <div style={{display: 'flex', alignItems: 'left'}}>
                <GetInt init={searchText} callBack={setSearchText} title='pattern  &nbsp;' type='text' pattern="[0-9_a-zA-Z\\.]+" width = '25%'/>
                <button onClick={() => searchSymbols(searchText)}> sym search</button>&nbsp;
            </div>
            <pre>{JSON.stringify(searchResults, null, 2)}</pre>
        </div>
    )

}


export {SymSearch }



