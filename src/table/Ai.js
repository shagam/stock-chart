import React, {useState} from 'react';
import { Link, useNavigate } from 'react-router-dom'
// import OpenAI from 'openai'
import axios from 'axios'


function Ai  (props) {

  const [input, setInput] = useState("");
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
      setResponse("Error calling Copilot API");
    }
  };

    // const callCopilot = async () => {
    //     try {
    //     const res = await fetch("https://api.copilot.microsoft.com/chat/completions", {
    //         method: "POST",
    //         headers: {
    //         "Content-Type": "application/json",
    //         "Authorization": `Bearer ${process.env.REACT_APP_COPILOT_API_KEY}`, // store your key safely
    //         },
    //         body: JSON.stringify({
    //         messages: [
    //             { role: "system", content: "You are Copilot, a helpful assistant." },
    //             { role: "user", content: input }
    //         ],
    //         max_tokens: 200,
    //         }),
    //     });

    //     const data = await res.json();
    //     setResponse(data.choices[0].message.content);
    //     } catch (err) {
    //     console.error("Error calling Copilot API:", err);
    //     }
    // };

    // async function openAi () {

    //   const OPENAI_API_KEY="your_api_key_here"

    //   const stream = await client.chat.completions.create({
    //   model: "gpt-5.1",
    //   messages: [{ role: "user", content: "QQQ ticker long term average gain" }],
    //   stream: true,
    //   });
    // }

    // for await (const chunk of stream) {
    //   process.stdout.write(chunk.choices[0]?.delta?.content || "");
    // }

    
 return (
    <div style = {{border: '2px solid blue'}} >
      <div style = {{display: 'flex'}}>
        <div  style={{color: 'magenta' }}>  {props.chartSymbol} </div>  &nbsp; &nbsp;
        <h6 style={{color: 'blue'}}> Ai API Example (under development) </h6>  &nbsp; &nbsp;
      </div>



      {/* <h2>Copilot API Example under development</h2> */}
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Ask Copilot something..."
        rows={4}
        cols={50}
      />
      <br />
      <button onClick={callCopilot}>Copilot Send</button>
      <h3>Response:</h3>
      <p>{response}</p>
    </div>
  );}



export {Ai}