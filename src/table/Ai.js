import React, {useState} from 'react';
import { Link, useNavigate } from 'react-router-dom'
// import OpenAI from 'openai'
import axios from 'axios'
import ChatGpt from './Ai_1'
// import ChatGPT from './ChatGPT';



// console.log(response.output_text);
function Ai  (props) {

  const [input, setInput] = useState('What is the ticker of Microsoft?');
  const [response, setResponse] = useState("");

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

        const apiKey = process.env.REACT_APP_OPENAi_API_KEY; // Use environment variable

        try {
            console.log ('Calling OpenAI API with input:', input);
            const res = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: "gpt-4.1-nano", // Specify the model
                    messages: [{ role: "user", content: input }],
                }),
            });

            if (!res.ok) {
                throw new Error('Network status: ' + res.status);
            }

            const data = await res.json();
            setResponse(data.choices[0].message.content);
        } catch (error) {
            console.error('OpenAi Error calling the API:', error);
            setResponse('OpenAi Error: Unable to fetch response' + error.message);
        }
    };



 return (
    <div style = {{border: '2px solid blue'}} >
      <div style = {{display: 'flex'}}>
        <div  style={{color: 'magenta' }}>  {props.chartSymbol} </div>  &nbsp; &nbsp;
        <h6 style={{color: 'blue'}}> Ai API Example (under development) </h6>  &nbsp; &nbsp;
      </div>

      <h3>AI API Example</h3>
      <form onSubmit={OpenAI_handleSubmit}>
          <input style={{width: '400px'}}
              type="text"
              value={input}
              onChange={handleInputChange}
              placeholder="Ask something..."
              required
          />
          <button type="submit"> OpenAI Send</button>
      </form>

      <br />
      <h4>Ai response</h4>
      <textarea
        value={response}
        onChange={(e) => setInput(e.target.value)}
        // placeholder="Ask Copilot something..."
        rows={4}
        cols={50}
      />
      <br />
      <button onClick={callCopilot}>Copilot Send</button>
      {/* <button onClick={ handleSubmit}>openAi Send</button> */}

      {/* <p>{response}</p> */}

      <br /> 


    </div>
  );}



export {Ai}