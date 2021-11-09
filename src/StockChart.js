import React from 'react';
import Plot from 'react-plotly.js';
import {c_stockSymbol, c_API_KEY, c_callBack} from './Constants'
import "./StockChart.css";

// https://quant.stackexchange.com/questions/26162/where-can-i-get-a-list-of-all-yahoo-finance-stocks-symbols

class StockChart extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            stockChartXValues: [],
            stockChartYValues: [],
            //stocksChartHistory: {},
            histString: ""
        }
        console.log ('constructor ', this.props.StockSymbol, Date.now());
    }

    componentDidMount() {
        console.log ('componentDidMount ', this.props.StockSymbol, Date.now());
        this.fetchStock();
    }

    fetchStock() {
        const pointerToThis = this;
        const callBack = this.props.callBack;
        //const callBackToGetSymbol = this.props.symbolCallBack;
        const API_KEY = this.props[c_API_KEY];
        const API_KEY_ = 'BC9UV9YUBWM3KQGF';

        //console.log (`${this.props.StockSymbol}`);
        const period = [['DAILY', 'Daily)'],['WEEKLY', 'Weekly'],['MONTHLY', 'Monthly)']];
        let periodCapital = period[1][0];  


        let API_Call = `https://www.alphavantage.co/query?function=TIME_SERIES_${periodCapital}_ADJUSTED&symbol=${this.props.StockSymbol}&outputsize=compact&apikey=${API_KEY}`;
        console.log (API_KEY);

        const isEmpty = (str) => {
            if (str == null)
                return true;
            if (str === "")
                return true;
            return false;
        }

        if (isEmpty (this.props.StockSymbol)) {
            console.log (`undef symbol  (${this.props.StockSymbol})  `);
            return null;            
        }

        let stockChartXValuesFunction = [];
        let stockChartYValuesFunction = [];
        
        fetch(API_Call)
            .then(
                function(response) {
                    const respStr = JSON.stringify (response);
                    if (respStr.indexOf (' status: 200, ok: true') !== -1)
                        console.log(response);
                    return response.json();
                }
            )
            .then(
                (data) => {
                    const dataStr = JSON.stringify(data);
                    //this.state.stocksChartHistory[this.props.StockSymbol] = data;
                    //const stocksHistoryStr = JSON.stringify(this.state.stocksChartHistory); 
                    //localStorage.setItem ('stocksChartHistory', stocksHistoryStr);
                    // too frequent AlphaVantage api calls
                    if (dataStr.indexOf ('is 5 calls per minute and 500 calls per day') !== -1) {
                        alert (`${dataStr} (${this.props.StockSymbol}) ${API_Call} `);
                        return;
                    }
                    
                    if (dataStr.search('Error Message":"Invalid API call. Please retry or visit the documentation') != -1) {
                        alert (`Chart invalid symbol (${this.props.StockSymbol}) \n${dataStr}`);
                    }
                    console.log (dataStr.substr(0, 230));
       
                    //let periodTag = 'Time Series (Daily)';
                    let periodTag = 'Weekly Adjusted Time Series';
                    //let periodTag = 'Monthly Adjusted Time Series';
                    for (var key in data[`${periodTag}`]) {
                        stockChartXValuesFunction.push(key);
                        stockChartYValuesFunction.push(data[`${periodTag}`][key]['1. open']);
                    }
                    pointerToThis.setState({
                        stockChartXValues: stockChartXValuesFunction,
                        stockChartYValues: stockChartYValuesFunction
                    });

                    // build histArray to be sent to table, and hist to be displayed with chart
                    var histArray = [];
                    var histStr = "";
                    var num;
                    num = stockChartYValuesFunction[0] / stockChartYValuesFunction[1];
                    num = num.toFixed(2);
                    histStr += " 1w (" + num + ")  ";
                    histArray.push (num);
                    
                    num = stockChartYValuesFunction[0] / stockChartYValuesFunction[2];
                    num = num.toFixed(2);
                    histStr += " 2w (" + num + ")  ";
                    histArray.push (num);

                    num = stockChartYValuesFunction[0] / stockChartYValuesFunction[4];
                    num = num.toFixed(2);
                    histStr += " m (" + num + ")  ";
                    histArray.push (num);

                    num = stockChartYValuesFunction[0] / stockChartYValuesFunction[13];
                    num = num.toFixed(2);
                    histStr += " 3m (" + num + ")  ";
                    histArray.push (num);

                    num = stockChartYValuesFunction[0] / stockChartYValuesFunction[26];
                    num = num.toFixed(2);
                    histStr += " 6m (" + num + ")  ";
                    histArray.push (num);

                    num = stockChartYValuesFunction[0] / stockChartYValuesFunction[52];
                    num = num.toFixed(2);
                    if (num !== 'NaN')                    
                    histStr += " y (" + num + ")  ";
                    histArray.push (num);

                    num = stockChartYValuesFunction[0] / stockChartYValuesFunction[104];
                    num = num.toFixed(2);
                    if (num !== 'NaN')
                    histStr += " 2y (" + num + ")  ";
                    histArray.push (num);

                    num = stockChartYValuesFunction[0] / stockChartYValuesFunction[260];
                    num = num.toFixed(2);
                    if (num !== 'NaN')                    
                    histStr += " 5y (" + num + ")  ";
                    histArray.push (num);

                    num = stockChartYValuesFunction[0] / stockChartYValuesFunction[520];
                    num = num.toFixed(2);
                    if (num !== 'NaN')
                    histStr += " 10y (" + num + ")";
                    histArray.push (num);
                    this.setState ({histString: histStr});

                    // send historical value back to caller
                    callBack (histArray, this.props.StockSymbol);
                    //console.log (histArray);
                }
            )
    }

    render() {
        console.log ('render', Date.now());
        if (this.props.StockSymbol === "") {
            console.log (`Invalid StockSymbol (${this.props.StockSymbol})`);
            //return null;
        }
        return (
          <div className = 'hist'>
            <h4>  historical_gain({this.props.StockSymbol}): {this.state.histString}  </h4>
            <div className = 'chart'>
                <Plot
                data={[
                    {
                    x: this.state.stockChartXValues,
                    y: this.state.stockChartYValues,
                    type: 'scatter',
                    mode: 'lines+markers',
                    marker: { color: 'red' },
                    },

                ]}
                layout={{ width: 800, height: 400, title: 'stock_symbol:   ' + this.props.StockSymbol }}
                />
            </div>
          </div>
        );
    }
}

export default StockChart;
