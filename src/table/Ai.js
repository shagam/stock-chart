import React, {useState, useMemo} from 'react';
import { Link, useNavigate } from 'react-router-dom'
// import OpenAI from 'openai'
import axios from 'axios'
import { set } from 'date-fns';
import { ComboBoxSelect } from '../utils/ComboBoxSelect'

// import ChatGPT from './ChatGPT';



// console.log(response.output_text);
function Ai  (props) {

  // const keys = props.gainMap ? Object.keys(props.gainMap) : [];
  // const inp = 'Tickers: ' + Object.keys(props.gainMap).join(', ') + ', please tell me company names';
  const [input, setInput] = useState(() => {
    return JSON.parse(localStorage.getItem("openAiInput")) || "";
  });

  const [showRequest, setShowRequest] = useState(false);
  const [requestInput, setRequestInput] = useState('');
  const stockList =  Object.keys(props.gainMap).join(', ')
  const [response, setResponse] = useState("");

  const [openAiApiKey, setOpenAiApiKey] = useState(() => {
    return JSON.parse(localStorage.getItem("openAiApiKey")) || "";
  });

  const models = ['gpt-4o', 'gpt-5-nano', 'gpt-3.5-turbo', 'gpt-5.1', 'gpt-5-mini', 'gpt-5-micro', 'gpt-5-milli',
    'gpt-5-16k', 'gpt-5.1-16k',
    'gpt-4o-mini', 'gpt-4o-micro', 'gpt-4o-milli', 'gpt-4o-16k', 'gpt-3.5-turbo-16k',]

  const [selectedModel, setSelectedModel] = useState(models[1]);

  const [log, setLog] = useState(false);

  const [includeStocksInRequest, setIncludeStocksInRequest] = useState(true);
  const [pageAnalyse_checkbox, setPageAnalyse_checkbox] = useState(false);
  const [latency, setLatency] = useState()
  // const callCopilot = async () => {
  //   try {
  //     const res = await axios.post(
  //       "https://api.copilot.microsoft.com/chat/completions",
  //       {
  //         messages: [{ role: "user", content: input }],
  //         max_tokens: 200,
  //       },
  //       {
  //         headers: {
  //           "Content-Type": "application/json",
  //           "Authorization": `Bearer ${process.env.REACT_APP_COPILOT_API_KEY}`,
  //         },
  //       }
  //     );

  //     setResponse(res.data.choices[0].message.content);
  //   } catch (err) {
  //     console.error(err);
  //     setResponse("Error calling Copilot API " + err.message);
  //   }
  // };


    const OpenAI_handleSubmit = async (e) => {
         e.preventDefault();
        setResponse(''); // Clear previous response

        const apiKey = openAiApiKey || process.env.REACT_APP_OPENAi_API_KEY; // Use state variable or environment variable
        const mili = Date.now()
        setLatency('OpenAI request sent')

        try {
            var requestInput_ = input;
            if (pageAnalyse_checkbox && Object.keys (props.pageForAnalysis).length >0) {
              requestInput_ += ' Stock Options Data: ' + JSON.stringify (props.pageForAnalysis) + '. ';
            }
            else if (includeStocksInRequest) {
              requestInput_ = 'Tickers: ' + stockList + '. ' ;
            }


            setRequestInput(requestInput_);
            console.log ('Calling OpenAI API with input:',  requestInput_);
            const res = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: selectedModel, //"gpt-5-nano", // Specify the model
                    messages: [{ role: "user", content: requestInput_ }],
                }),
            });
            
            const latency = Date.now() - mili
            setLatency('Ai response, latency(msec)=' + latency)

            if (!res.ok) {
                throw new Error('Network status: ' + res.status);
            }

            const data = await res.json();
            setResponse(data.choices[0].message.content);
        } catch (error) {
            console.error('OpenAi Error calling the API:', error.message);
            setResponse('OpenAi Error: Unable to fetch response' + error.message);
        }
    };


    // user openAI api key support
    const apiKeyChange = (e) => {
        setOpenAiApiKey(e.target.value);
    };

    function apiKeySave() {
      localStorage.setItem('openAiApiKey', JSON.stringify(openAiApiKey));
    }

    function apiKeyClear() {
      setOpenAiApiKey("");
      localStorage.removeItem('openAiApiKey');
      console.log ('openApiKey cleared');
    }

     
    //** openAI input request support */
    const handleInputChange = (e) => {
        setInput(e.target.value);
    };

    function inputSave() {
      localStorage.setItem('openAiInput', JSON.stringify(input));
    }

    function inputClear() {
      setInput("");
      localStorage.removeItem('openAiInput');
      console.log ('input cleared');
    }


 return (
    <div style = {{border: '2px solid blue'}} >
      <div style = {{display: 'flex'}}>
        <div  style={{color: 'magenta' }}>  {props.chartSymbol} </div>  &nbsp; &nbsp;
        <h6 style={{color: 'blue'}}> Ai API Example (under development) </h6>  &nbsp; &nbsp;
      </div>



      <h3>OpenAI API Experiment </h3>
      {latency && <div style={{color: '#aa3333'}}>{latency}</div>}
      <div style={{display: 'flex'}}>
        <ComboBoxSelect serv={selectedModel} nameList={models} setSelect={setSelectedModel}
                  title='openAi-model' options={models} defaultValue={selectedModel}/> &nbsp; &nbsp; &nbsp;
        <input  type="checkbox" checked={log}  onChange={()=>setLog(! log)} /> &nbsp;log  &nbsp; &nbsp;
        <input  type="checkbox" checked={showRequest}  onChange={()=>setShowRequest(! showRequest)} /> &nbsp;showRequest
      </div>

      <br /> 
      {/* user openAI api key  */}

      <form>
          <h6><strong style={{color: '#7ccae2'}}>user openAI API Key</strong></h6>
          <input style={{width: '600px'}}
              type="text"
              value={openAiApiKey}
              onChange={apiKeyChange}
              placeholder="enter personal api-key"
              required
          />
          {/* <button type="submit"> save </button> */}
      </form>

      <button onClick={() => apiKeySave()}>save</button> &nbsp;
      <button onClick={() => apiKeyClear()}>clear</button>
      <hr/> 
      <br />  


      {Object.keys(props.pageForAnalysis).length > 0 && <h6 style={{color: 'magenta'}} >
        <input  type="checkbox" checked={pageAnalyse_checkbox}  onChange={()=>setPageAnalyse_checkbox(! pageAnalyse_checkbox)} /> &nbsp;pageForAnalysis
      </h6>}

      {Object.keys(props.pageForAnalysis).length === 0 && <div style={{display: 'flex'}}>
        <input  type="checkbox" checked={includeStocksInRequest}  onChange={()=>setIncludeStocksInRequest(! includeStocksInRequest)} /> 
          &nbsp;  include-Stocks-In-Request: &nbsp;
        <div> &nbsp; {stockList }</div>
      </div>}

      <form>
         <h6> <strong style={{color: '#7ccae2'}}>Edit request</strong></h6>
          <input style={{width: '600px'}}
              type="text"
              value={input}
              onChange={handleInputChange}
              placeholder="Ask something..."
              required
          />
          {/* <button type="submit"> OpenAI Send</button> */}
      </form>
      
      <button onClick={() => inputSave()}>save</button> &nbsp;
      <button onClick={() => inputClear()}>clear</button>
      
      <br />
      <br />
      {/* {<button onClick={callCopilot}>Copilot Send</button>} &nbsp;  */}
     
      <button  style={{background: 'aqua'}} onClick={OpenAI_handleSubmit}>OpenAI Send</button> &nbsp; 
       {showRequest && requestInput}
      <br />
      <br />
      <h4>Ai response</h4>
      <textarea
        value={response}
        onChange={(e) => setInput(e.target.value)}
        // placeholder="Ask Copilot something..."
        rows={16}
        cols={80}
      />
      <br />

      {/* <button onClick={ handleSubmit}>openAi Send</button> */}

      {/* <p>{response}</p> */}

      <br /> 


    </div>
  );}



export {Ai}