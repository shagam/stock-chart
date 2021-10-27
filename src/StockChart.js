import React from 'react';
import Plot from 'react-plotly.js';

// https://quant.stackexchange.com/questions/26162/where-can-i-get-a-list-of-all-yahoo-finance-stocks-symbols

class StockChart extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            stockChartXValues: [],
            stockChartYValues: [],
            stocksChartHistory: {},
            histStr: ""
        }
    }

    componentDidMount() {
        this.fetchStock();
    }

    fetchStock() {
        const pointerToThis = this;
        const callBack = this.props.callBack; 
        const API_KEY = this.props["API_KEY"];
        const API_KEY_ = 'BC9UV9YUBWM3KQGF';
        //const StockSymbol = this.props.StockSymbol;
        console.log (`StockSymbol ${this.props["StockSymbol"]}`);
        const period = [['DAILY', 'Daily)'],['WEEKLY', 'Weekly'],['MONTHLY', 'Monthly)']];
        let periodCapital = period[1][0];  


        let API_Call = `https://www.alphavantage.co/query?function=TIME_SERIES_${periodCapital}_ADJUSTED&symbol=${this.props.StockSymbol}&outputsize=compact&apikey=${API_KEY_}`;

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
                    this.state.stocksChartHistory[`${this.props.StockSymbol}`] = data;
                    const stocksHistoryStr = JSON.stringify(this.state.stocksChartHistory); 
                    localStorage.setItem ('stocksChartHistory', stocksHistoryStr);

                    if (dataStr.indexOf ('Invalid API call. ') !== -1)
                        console.log (`API_Call ${API_Call}`);    
                    console.log (dataStr.substr(0, 230));
                    if (`${this.props.StockSymbol}` !== null && data !== null) {
                        //this.recordedHist.setState ({StockSymbol}, data);
                        localStorage.setItem (`${this.props.StockSymbol}_priceHistory`, dataStr);
                    }

                    //let periodTag = 'Time Series (Daily)';
                    let periodTag = 'Weekly Adjusted Time Series';
                    //let periodTag = 'Monthly Adjusted Time Series';
                    for (var key in data[`${periodTag}`]) {
                        stockChartXValuesFunction.push(key);
                        stockChartYValuesFunction.push(data[`${periodTag}`][key]['1. open']);
                    }
                   
                    var histArray = [];
                    this.setState ({histStr: ""});
                    var num;
                    num = stockChartYValuesFunction[0] / stockChartYValuesFunction[1];
                    num = num.toFixed(2);
                    this.setState ({histStr: this.state.histStr + " 1w (" + num + ")  "});
                    histArray.push (num);
                    
                    num = stockChartYValuesFunction[0] / stockChartYValuesFunction[2];
                    num = num.toFixed(2);
                    this.setState ({histStr: this.state.histStr + " 2w (" + num + ")  "});
                    histArray.push (num);

                    num = stockChartYValuesFunction[0] / stockChartYValuesFunction[4];
                    num = num.toFixed(2);
                    this.setState ({histStr: this.state.histStr + " m (" + num + ")  "});
                    histArray.push (num);

                    num = stockChartYValuesFunction[0] / stockChartYValuesFunction[13];
                    num = num.toFixed(2);
                    this.setState ({histStr: this.state.histStr + " 3m (" + num + ")  "});
                    histArray.push (num);

                    num = stockChartYValuesFunction[0] / stockChartYValuesFunction[26];
                    num = num.toFixed(2);
                    this.setState ({histStr: this.state.histStr + " 6m (" + num + ")  "});
                    histArray.push (num);

                    num = stockChartYValuesFunction[0] / stockChartYValuesFunction[52];
                    num = num.toFixed(2);
                    if (num !== 'NaN')                    
                    this.setState ({histStr: this.state.histStr + " y (" + num + ")  "});
                    histArray.push (num);

                    num = stockChartYValuesFunction[0] / stockChartYValuesFunction[104];
                    num = num.toFixed(2);
                    if (num !== 'NaN')
                    this.setState ({histStr: this.state.histStr + " 2y (" + num + ")  "});
                    histArray.push (num);

                    num = stockChartYValuesFunction[0] / stockChartYValuesFunction[260];
                    num = num.toFixed(2);
                    if (num !== 'NaN')                    
                    this.setState ({histStr: this.state.histStr + " 5y (" + num + ")  "});
                    histArray.push (num);

                    num = stockChartYValuesFunction[0] / stockChartYValuesFunction[520];
                    num = num.toFixed(2);
                    if (num !== 'NaN')
                    this.setState ({histStr: this.state.histStr + " 10y (" + num + ")"});
                    histArray.push (num);

                    // send historical value back to caller
                    callBack (`${histArray}`, `${this.props.StockSymbol}`);
                    //console.log (histArray);
                    pointerToThis.setState({
                        stockChartXValues: stockChartXValuesFunction,
                        stockChartYValues: stockChartYValuesFunction
                    });
                }
            )
    }

    render() {
        if (this.props.StockSymbol == null)
           return null;
        return (
          <div>
            <h4> historical_gain({this.props.StockSymbol}): {this.state.histStr} </h4>
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
              layout={{ width: 720, height: 400, title: 'stock_symbol:   ' + this.props.StockSymbol }}
            />
          </div>
        );
    }
}

export default StockChart;
