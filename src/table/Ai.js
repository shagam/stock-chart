import React, {useState, useMemo} from 'react';
import { Link, useNavigate } from 'react-router-dom'
// import OpenAI from 'openai'
import axios from 'axios'
import { set } from 'date-fns';
import { ComboBoxSelect } from '../utils/ComboBoxSelect'
import {beep2} from '../utils/ErrorList'
import {getDate} from '../utils/Date'
// import { OpenAI } from 'openai/client.js';

// import ChatGPT from './ChatGPT';



// console.log(response.output_text);
function Ai  (props) {

  // const keys = props.gainMap ? Object.keys(props.gainMap) : [];
  // const inp = 'Tickers: ' + Object.keys(props.gainMap).join(', ') + ', please tell me company names';
  const [input, setInput] = useState(() => {
    return JSON.parse(localStorage.getItem("openAiInput")) || "";
  });

  const [aiPageShow_checkbox, setAiPageShow_checkbox] = useState(false);
  const [showRequest, setShowRequest] = useState(false);
  const [requestInput, setRequestInput] = useState('');
  const stockList =  Object.keys(props.gainMap).join(', ')
  const [response, setResponse] = useState("");
  const [err, setErr] = useState("");

  const aiBrandList = ['OpenAI', 'DeepSeek',];// 'Anthropic', 'Cohere', 'AI21', 'Mistral', 'Google PaLM2'];
  const [aiBrand, setAiBrand] = useState(aiBrandList[0]);


  const [openAi_apiKeyShow_checkbox, setOpenAi_ApiKeyShow_checkbox] = useState(false);
  const [openAiApiKey, setOpenAiApiKey] = useState(() => {
    return JSON.parse(localStorage.getItem("openAiApiKey")) || "";
  });

  const [openAiTokenCount, setOpenAiTokenCount] = useState(0);
  const [deepseekTokenCount, setDeepSeekTokenCount] = useState(0);
  
    const OPEN_AI_MODELS = ['gpt-4o', 'gpt-5-nano', 'gpt-3.5-turbo', 'gpt-5.1', 'gpt-5-mini', //  'gpt-5-micro',  'gpt-5-milli',
    //'gpt-5-16k', 'gpt-5.1-16k',  'gpt-4o-mili',
    'gpt-4o-mini', 'gpt-3.5-turbo-16k',]//'gpt-4o-micro',  'gpt-4o-16k',

  const [openAi_selectedModel, set_openAi_SelectedModel] = useState(OPEN_AI_MODELS[1]);


  const [deepSeek_apiKeyShow_checkbox, setDeepSeek_ApiKeyShow_checkbox] = useState(false);
  const [deepSeekApiKey, setDeepSeekApiKey] = useState(() => {
    return JSON.parse(localStorage.getItem("deepSeekApiKey")) || "";
  });



  const [log, setLog] = useState(false);

  const [includeStocksInRequest, setIncludeStocksInRequest] = useState(false);
  const [pageAI_addToRequest_checkbox, setPageAI_addToRequest_checkbox] = useState(props.pageForAi? true: false);

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

    function estimateTokens(text) {
      return Math.ceil(text.split(/\s+/).length * 1.3);
    }

    const OpenAI_handleSubmit = async (e) => {
         e.preventDefault();
        setResponse(''); // Clear previous response
        setErr('');

        if (openAiTokenCount + deepseekTokenCount > 1000) {
          setErr('Token limit exceeded. Please contact support.', openAiTokenCount + deepseekTokenCount);
          beep2()
          return;
        }
        var apiKey;
        var fetchUrl;
        var aiModel
        if (aiBrand === 'OpenAI') {
          apiKey = openAiApiKey || process.env.REACT_APP_OPENAi_API_KEY; // Use state variable or environment variable
          fetchUrl = 'https://api.openai.com/v1/chat/completions';
          aiModel = openAi_selectedModel;
        } else if (aiBrand === 'DeepSeek') {
          apiKey = deepSeekApiKey || process.env.REACT_APP_DEEPSEEK_API_KEY; // Use state variable or environment variable
          fetchUrl = 'https://api.deepseek.com/chat/completions';
          aiModel = 'deepseek-chat';
        } else {
          setResponse('Error: Unsupported AI brand selected');
          return;
        }
        const mili = Date.now()
        setLatency('OpenAI request sent ...')

        try {
            var requestInput_ = input;
            if (pageAI_addToRequest_checkbox && props.pageForAi) {
              requestInput_ += JSON.stringify (props.pageForAi) + '. ';
            }
            else if (includeStocksInRequest) {
              requestInput_ +=  ' ' + stockList;
            }

            const tokenCount = estimateTokens(requestInput_);
            const tokenCountSaved = JSON.parse(localStorage.getItem("tokenCountSum")) || 0;
            const tokenCountSum_ = tokenCount + tokenCountSaved
            localStorage.setItem("tokenCountSum", JSON.stringify(tokenCountSum_));
    
            setRequestInput(requestInput_);
            // console.log ('Calling OpenAI API with input:',  requestInput_);
            const request = {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: aiModel, //"gpt-5-nano", // Specify the model
                    messages: [{ role: "user", content: requestInput_ }],
                }),
                language: 'en',
            }
            // if (log)
              console.log ('AI  request:', fetchUrl, 'tokens=' + tokenCount, request)
            const res = await fetch(fetchUrl, request);
            
            const latency = Date.now() - mili
            setLatency('Ai response, latency(msec)=' + latency)

            if (!res.ok) {
                throw new Error('Network status: ' + res.status);
            }

            const data = await res.json();
            setResponse(data.choices[0].message.content);


            // send request to backend for logging
            if (true)
               {
              var corsUrl;


              corsUrl = "https://";
              corsUrl += props.corsServer+ ":" + props.PORT + "/ai?record=true"; 

              corsUrl += '&stock=' + props.chartSymbol  + '&brand=' + aiBrand
              if (aiBrand === 'OpenAI') 
                corsUrl += '&model=' + aiModel
              corsUrl += '&ip=' + props.ip 
              corsUrl += '&city=' + props.city + '&countryName=' + props.countryName;
              corsUrl += '&countryCode=' + props.countryCode + '&regionName=' + props.regionName ;
              corsUrl += '&tokenCount=' + tokenCount;

              if (log || true) {
                corsUrl += '&log=true';
                console.log ('Logging Ai request to back-end:', corsUrl)
              }
              // corsUrl += + '&request=' + requestInput_.substring(0, 500);
              // corsUrl += + '&response=' + data.choices[0].message.content.substring(0, 500);

              axios.get (corsUrl)
                .then ((result) => {
                  if (log)
                    console.log (getDate(), props.chartSymbol, result.status, result.data );
                  if (result.status !== 200 || result.data.status !== 'ok') {
                    setErr(result.status + ' ' + result.message + ' ' + result.data );
                    beep2();
                    // console.log (getDate(), props.chartSymbol, 'status=', result)
                    return;
                  }

                  setOpenAiTokenCount (result.data.openAi);
                  setDeepSeekTokenCount (result.data.deepseek);
                })
            }

        } catch (error) {
            console.error(aiBrand, ' Ai api fail:', error.message);
            setResponse(aiBrand + ' Ai api fail: ' + error.message);
        }
    };


    // user openAI api key support
    const apiKeyChange = (e) => {
        setOpenAiApiKey(e.target.value);
    };

    function openAiApiKeySave() {
      localStorage.setItem('openAiApiKey', JSON.stringify(openAiApiKey));
    }

    function openAiApiKeyClear() {
      setOpenAiApiKey("");
      localStorage.removeItem('openAiApiKey');
      console.log ('openApiKey cleared');
    }


    // user deepSeek api key support
    const deepSeekApiKeyChange = (e) => {
        setDeepSeekApiKey(e.target.value);
    };

    function deepSeekApiKeySave() {
      localStorage.setItem('deepSeekApiKey', JSON.stringify(deepSeekApiKey));
    }

    function deepSeekApiKeyClear() {
      setDeepSeekApiKey("");
      localStorage.removeItem('deepSeekApiKey');
      console.log ('deepSeekApiKey cleared');
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
        <div style={{color: 'green'}} > User tokens used, &nbsp; openAi: {openAiTokenCount} &nbsp; deepSeek: {deepseekTokenCount}  </div>
      </div>
      {err !== '' && <div style={{color: 'red'}}>err: {err}</div>}


      <h3>OpenAI API Experiment </h3>
      <div style={{display: 'flex'}}>
        <ComboBoxSelect serv={aiBrand} nameList={aiBrandList} setSelect={setAiBrand}
          title='aiBrand' options={aiBrandList} defaultValue={aiBrandList[0]}/> &nbsp; &nbsp; &nbsp;

        <input  type="checkbox" checked={log}  onChange={()=>setLog(! log)} /> &nbsp;log  &nbsp; &nbsp;
      </div>

      <hr style={{color: 'red', border: '8px solid #7ccae2'}}/> 
      
      {/* <br />  */}
      {/* user openAI api key  */}
      {aiBrand === 'OpenAI' && <div>
        <ComboBoxSelect serv={openAi_selectedModel} nameList={OPEN_AI_MODELS} setSelect={set_openAi_SelectedModel}
          title='openAi-model' options={OPEN_AI_MODELS} defaultValue={openAi_selectedModel}/>

        <input  type="checkbox" checked={openAi_apiKeyShow_checkbox}  onChange={()=>setOpenAi_ApiKeyShow_checkbox(! openAi_apiKeyShow_checkbox)} /> &nbsp;personal openAI apiKey  &nbsp; &nbsp;
        {openAi_apiKeyShow_checkbox && <div>
          <form>
              <input style={{width: '600px'}}
                  type="text"
                  value={openAiApiKey}
                  onChange={apiKeyChange}
                  placeholder="enter personal openAi api-key"
                  required
              />
              {/* <button type="submit"> save </button> */}
          </form>

          <button onClick={() => openAiApiKeySave()}>save</button> &nbsp;
          <button onClick={() => openAiApiKeyClear()}>clear</button>
        </div>}
        <hr style={{color: 'red', border: '8px solid #7ccae2'}}/> 
      </div>}


      {/* <br />   */}

      {/* user openAI api key  */}

      {aiBrand === 'DeepSeek' && <div>
        <input  type="checkbox" checked={deepSeek_apiKeyShow_checkbox}  onChange={()=> setDeepSeek_ApiKeyShow_checkbox(! deepSeek_apiKeyShow_checkbox)} /> &nbsp;personal deepSeek apiKey  &nbsp; &nbsp;
        {deepSeek_apiKeyShow_checkbox && <div>
          <form>
              <input style={{width: '600px'}}
                  type="text"
                  value={deepSeekApiKey}  
                  onChange={deepSeekApiKeyChange}
                  placeholder="enter personal deepSeek api-key"
                  required
              />
              {/* <button type="submit"> save </button> */}
          </form>

          <button onClick={() => deepSeekApiKeySave()}>save</button> &nbsp;
          <button onClick={() => deepSeekApiKeyClear()}>clear</button>
        </div>}
        <hr style={{color: 'red', border: '8px solid #7ccae2'}}/> 
      </div>}


      {/* <br />   */}



      {props.pageForAiText && 
       <div style={{display: 'flex'}}>
          <input  type="checkbox" checked={pageAI_addToRequest_checkbox}  onChange={()=>setPageAI_addToRequest_checkbox(! pageAI_addToRequest_checkbox)} /> &nbsp;
          &nbsp;AiPage add to request: &nbsp; &nbsp; <div style={{color: 'magenta'}} >{props.pageForAiText } </div>
      </div>}

      {props.pageForAi && <div><input  type="checkbox" checked={aiPageShow_checkbox}  onChange={()=>setAiPageShow_checkbox(! aiPageShow_checkbox)} /> &nbsp; AiPage show &nbsp; &nbsp;
        {aiPageShow_checkbox && <div style={{maxHeight:'300px', maxWidth: '800px', overflow:'auto', border: '1px solid gray', background: '#f0f0f0'}}>
        <pre> {props.pageForAi && JSON.stringify (props.pageForAi, null, 2)} </pre>
      </div>}
      </div>}

      {/* <br /> */}
      {! pageAI_addToRequest_checkbox && <div style={{display: 'flex'}}>
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
     
      <button  style={{background: 'aqua'}} onClick={OpenAI_handleSubmit}>AI request Send</button> &nbsp; 
      <input  type="checkbox" checked={showRequest}  onChange={()=>setShowRequest(! showRequest)} /> &nbsp;Request show  &nbsp; &nbsp;
      {showRequest && requestInput}
      {/* {err && <div style={{color: 'red'}}>Error: {err} </div>} */}
      {latency && <div style={{color: 'green'}}> {latency} </div>}
     
      <br />
      <br />
      {response && <div>
        <h4>Ai response</h4>
        <textarea
          value={response}
          onChange={(e) => setInput(e.target.value)}
          // placeholder="Ask Copilot something..."
          rows={50}
          cols={120}
        />
        <br />
      </div>}

      <br /> 
    </div>
  );}



export {Ai}