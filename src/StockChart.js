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
        const callBackToGetSymbol = this.props.symbolCallBack;
        const API_KEY = this.props["API_KEY"];
        const API_KEY_ = 'BC9UV9YUBWM3KQGF';
        const chartSymbolCount = this.props.chartSymbolCount;

        //const StockSymbol = this.props.StockSymbol;
        console.log (`StockSymbol (${this.props["StockSymbol"]})`);
        const period = [['DAILY', 'Daily)'],['WEEKLY', 'Weekly'],['MONTHLY', 'Monthly)']];
        let periodCapital = period[1][0];  


        let API_Call = `https://www.alphavantage.co/query?function=TIME_SERIES_${periodCapital}_ADJUSTED&symbol=${this.props.StockSymbol}&outputsize=compact&apikey=${API_KEY_}`;

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
                    this.state.stocksChartHistory[this.props.StockSymbol] = data;
                    const stocksHistoryStr = JSON.stringify(this.state.stocksChartHistory); 
                    localStorage.setItem ('stocksChartHistory', stocksHistoryStr);

                    if (dataStr.indexOf ('Invalid API call. ') !== -1) {
                        console.log (`Invalid API_Call symbol=(${this.props.StockSymbol}) ${API_Call} `);
                        return;
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
                    callBack (histArray, this.props.StockSymbol);
                    //console.log (histArray);
                }
            )
    }

    render() {
        if (this.props.StockSymbol == "") {
            console.log (`Invalid StockSymbol (${this.props.StockSymbol})`);
            return null;
        }
        return (
          <div>
            <h4> clickCount: ({this.props.chartSymbolCount}), historical_gain({this.props.StockSymbol}): {this.state.histStr}  </h4>
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
