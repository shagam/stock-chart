import axios from 'axios'
import {getDate,} from '../utils/Date'
// const finnhub = require('finnhub');
// import finnhub from 'finnhub';
import {targetPriceAdd} from './TargetPrice'
// function Finnhub (props) {

    function finnhub (symbol, stockChartYValues, rows, refreshByToggleColumns, setErr, logFlags, errorAdd, ssl, PORT, servSelect, setPriceDivClose, eliHome, checkPriceColumnVisible) {

        const url = 'https://finnhub.io/api/v1/quote?symbol=' + symbol + '&token=' + process.env.REACT_APP_FINNHUB

        // const api_key = finnhub.ApiClient.instance.authentications['api_key'];
        // api_key.apiKey = "c4pfifqad3ifau3r1kjg" // Replace this
        // const finnhubClient = new finnhub.DefaultApi()
        // console.log(symbol, url)
        axios.get (url)

        .then ((result) => {
            if (result.status !== 200)
                return;

            const dat = result.data
            if (dat.c === 0 && dat.d === null) {
                errorAdd([symbol, ' finnhub invalid symbol'])
                return;
            }
            const price = Number(dat.c)
            if (price === 0) {
                console.log (symbol, 'price=' + price)
            }
            const row_index = rows.findIndex((row)=> row.values.symbol === symbol);
            rows[row_index].values.price = price.toFixed(2);
            rows[row_index].values.price_mili = Date.now();

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

            const priceDivHigh = (price / highestPrice).toFixed(4);
            console.log (symbol, getDate(), 'price=' + price, ' highest=' + highestPrice.toFixed(2), ' price/High=' + priceDivHigh,
             'closePrice=' + stockChartYValues[0], 'price/close=' + (price / stockChartYValues[0]).toFixed(4))

            rows[row_index].values.priceDivHigh = priceDivHigh;
            if (rows[row_index].values.target_raw)
                rows[row_index].values.target = (rows[row_index].values.target_raw / price).toFixed(3); // update targetPrice
            else
                if (logFlags.includes('target'))
                    console.log (symbol, 'finnhub no target price. probaly an ETF')

            const ratio = price/stockChartYValues[0]
            const sign = ratio > 1 ? '+' : '' 
            const color = ratio > 1 ? '#82b74b': 'red'; 
            var priceDivCloseObj = {symbol: symbol, price: price, sign: sign, ratio: ((price/stockChartYValues[0] -1) * 100).toFixed(2), color: color};

            if (true * Date.now() - rows[row_index].values.gain_mili < 1000*60*60 && ratio !== 1) { // less than 1 hour diff && stock value is not the same as the close value
                setPriceDivClose (priceDivCloseObj)
                console.log (priceDivCloseObj)
            }
            else
                setPriceDivClose()
            checkPriceColumnVisible()
            setErr()
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