import axios from 'axios'
import {getDate,} from '../utils/Date'
// const finnhub = require('finnhub');
// import finnhub from 'finnhub';

// function Finnhub (props) {

    function finnhub (symbol, stockChartYValues, rows, refreshByToggleColumns) {

        const url = 'https://finnhub.io/api/v1/quote?symbol=' + symbol + '&token=c4pfifqad3ifau3r1kjg'

        // const api_key = finnhub.ApiClient.instance.authentications['api_key'];
        // api_key.apiKey = "c4pfifqad3ifau3r1kjg" // Replace this
        // const finnhubClient = new finnhub.DefaultApi()

        axios.get (url)

        .then ((result) => {
            if (result.status !== 200)
                return;

            const dat = result.data

            console.log ('results=', dat.c)

            // find highest price
            var highestPrice = -1; // highest price
            for (let i = 0; i < stockChartYValues.length; i++) {
                const val = stockChartYValues[i];
                if (val > highestPrice)
                    highestPrice = val;
            }

            const row_index = rows.findIndex((row)=> row.values.symbol === symbol);
            const price = Number(dat.c)
            rows[row_index].values.price = price.toFixed(2);
            rows[row_index].values.priceDivHigh = (price / highestPrice).toFixed(3); 
            refreshByToggleColumns();
        }).catch ((err) => {
            console.log(getDate(), err.message)
        })   


        // Stock candles
        // finnhubClient.stockCandles("AAPL", "D", 1590988249, 1591852249, (error, data, response) => {
        //     console.log(data)
        // });

        //Company News
        // finnhubClient.companyNews("AAPL", "2020-01-01", "2020-05-01", (error, data, response) => {
        //     if (error) {
        //         console.error(error);
        //     } else {
        //         console.log(data)
        //     }
        // });

        // Investor Ownership
        let optsLimit = {'limit': 10};
        // finnhubClient.ownership("AAPL", optsLimit, (error, data, response) => {
        //     console.log(data)
        // });

        //Aggregate Indicator
        // finnhubClient.aggregateIndicator("AAPL", "D", (error, data, response) => {
        //     console.log(data)
        // });

        // Basic financials
        // finnhubClient.companyBasicFinancials("AAPL", "margin", (error, data, response) => {
        //     console.log(data)
        // });

    }
// }

export {finnhub}