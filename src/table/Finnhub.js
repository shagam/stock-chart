import axios from 'axios'
import {getDate,} from '../utils/Date'
// const finnhub = require('finnhub');
// import finnhub from 'finnhub';
import {targetPriceAdd} from './TargetPrice'
// function Finnhub (props) {

    function finnhub (symbol, stockChartYValues, rows, refreshByToggleColumns, setErr, logFlags, errorAdd, ssl, PORT, servSelect) {

        const url = 'https://finnhub.io/api/v1/quote?symbol=' + symbol + '&token=c4pfifqad3ifau3r1kjg'

        // const api_key = finnhub.ApiClient.instance.authentications['api_key'];
        // api_key.apiKey = "c4pfifqad3ifau3r1kjg" // Replace this
        // const finnhubClient = new finnhub.DefaultApi()

        axios.get (url)

        .then ((result) => {
            if (result.status !== 200)
                return;

            const dat = result.data
            const price = Number(dat.c)
            if (price === 0) {
                console.log (symbol, 'price=' + price)
            }
            const row_index = rows.findIndex((row)=> row.values.symbol === symbol);
            rows[row_index].values.price = price.toFixed(2);

            // find highest price
            var highestPrice = -1; // highest price
            for (let i = 0; i < stockChartYValues.length; i++) {
                const val = stockChartYValues[i];
                if (val > highestPrice)
                    highestPrice = val;
            }
            if (highestPrice === -1) {
                console.log (symbol, 'finnhub, missing stockChartYValues, pls try again')
                setErr (symbol + '  finnhub, missing stockChartYValues, pls try again')
                // refreshByToggleColumns();
                return;
            }

            console.log ('price=' + price, ' highest=' + highestPrice.toFixed(2), ' price/High=' + (price / highestPrice).toFixed(3))


            rows[row_index].values.priceDivHigh = (price / highestPrice).toFixed(3);
            if (rows[row_index].values.target_raw)
                rows[row_index].values.target = (rows[row_index].values.target_raw / price).toFixed(3); // update targetPrice
            else
                console.log (symbol, 'finnhub no target price')
            targetPriceAdd (symbol, rows[row_index].values.target_raw, rows[row_index].values.price, logFlags, errorAdd, 'lastPrice', ssl, PORT, servSelect) // update targetPrice
            refreshByToggleColumns();
        }).catch ((err) => {
            console.log(getDate(), finnhub, err.message)
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