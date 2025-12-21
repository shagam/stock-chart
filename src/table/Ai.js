import React, {useState, useMemo} from 'react';
import { Link, useNavigate } from 'react-router-dom'
// import OpenAI from 'openai'
import axios from 'axios'
import { set } from 'date-fns';

// import ChatGPT from './ChatGPT';



// console.log(response.output_text);
function Ai  (props) {

  // const keys = props.gainMap ? Object.keys(props.gainMap) : [];
  // const inp = 'Tickers: ' + Object.keys(props.gainMap).join(', ') + ', please tell me company names';
  const [input, setInput] = useState('Tickers: ' + Object.keys(props.gainMap).join(', ') + ', please tell me company names');
  const [response, setResponse] = useState("");

  const [openAiApiKey, setOpenAiApiKey] = useState(() => {
    return JSON.parse(localStorage.getItem("openAiApiKey")) || "";
  });

  
  const [log, setLog] = useState(false);

  const callCopilot = async () => {
    try {
      const res = await axios.post(
        "https://api.copilot.microsoft.com/chat/completions",
        {
          messages: [{ role: "user", content: input }],
          max_tokens: 200,
        },
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.REACT_APP_COPILOT_API_KEY}`,
          },
        }
      );

      setResponse(res.data.choices[0].message.content);
    } catch (err) {
      console.error(err);
      setResponse("Error calling Copilot API " + err.message);
    }
  };


     const handleInputChange = (e) => {
        setInput(e.target.value);
    };

    const OpenAI_handleSubmit = async (e) => {
         e.preventDefault();
        setResponse(''); // Clear previous response

        const apiKey = openAiApiKey || process.env.REACT_APP_OPENAi_API_KEY; // Use state variable or environment variable

        try {
            console.log ('Calling OpenAI API with input:', input);
            const res = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: "gpt-5-nano", // Specify the model
                    messages: [{ role: "user", content: input }],
                }),
            });

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

    const apiKeyChange = (e) => {
        setOpenAiApiKey(e.target.value);
    };

    function apiKeySave() {
      localStorage.setItem('openAiApiKey', JSON.stringify(openAiApiKey));
    }

    function apiKeyClear() {
      localStorage.removeItem('openAiApiKey');
      setOpenAiApiKey(null);
      console.log ('openApiKey cleared');
    }


 return (
    <div style = {{border: '2px solid blue'}} >
      <div style = {{display: 'flex'}}>
        <div  style={{color: 'magenta' }}>  {props.chartSymbol} </div>  &nbsp; &nbsp;
        <h6 style={{color: 'blue'}}> Ai API Example (under development) </h6>  &nbsp; &nbsp;
      </div>



      <h3>AI API Experiment </h3>

      <form>
          <input style={{width: '600px'}}
              type="text"
              value={openAiApiKey}
              onChange={apiKeyChange}
              placeholder="enter personal api-key"
              required
          />
          {/* <button type="submit"> save </button> */}
      </form>

      <button onClick={() => apiKeySave()}>save key</button> &nbsp;
      <button onClick={() => apiKeyClear()}>clear key</button>

      <br />
      <form>
          <input style={{width: '600px'}}
              type="text"
              value={input}
              onChange={handleInputChange}
              placeholder="Ask something..."
              required
          />
          {/* <button type="submit"> OpenAI Send</button> */}
      </form>
      <br />
      {/* {<button onClick={callCopilot}>Copilot Send</button>} &nbsp;  */}
      {props.eliHome && <button onClick={OpenAI_handleSubmit}>OpenAI Send</button>}
      <br />
      <br />
      <h4>Ai response</h4>
      <textarea
        value={response}
        onChange={(e) => setInput(e.target.value)}
        // placeholder="Ask Copilot something..."
        rows={5}
        cols={80}
      />
      <br />

      {/* <button onClick={ handleSubmit}>openAi Send</button> */}

      {/* <p>{response}</p> */}

      <br /> 


    </div>
  );}



export {Ai}