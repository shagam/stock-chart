import  { useState, useEffect } from 'react'



export const MobileContext = () => {
  const [userAgent, setUserAgent] = useState("");
  const [userAgentMobile, setUserAgentMobile] = useState(false);
  const [isAndroid, setIsAndroid] = useState("");
  const [isIPhone, setIsIphone] = useState("");

    const LOG = false;
  
  useEffect (() => { 
    //getGain();
    checkMobile();
     //getInfo();

  }, [])

  

  const checkMobile = async () => {

    // userAgent
    // const userAgent = navigator.userAgent;
    setUserAgent(navigator.userAgent)
    //if (/Android/i.test(navigator.userAgent))
    if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)){
      setUserAgentMobile(true);
    } else {
      setUserAgentMobile(false);
      if (LOG)
        console.log("not mobile device");
    }
    
    if (/Android/i.test(navigator.userAgent))
      setIsAndroid(true)
    else
      setIsAndroid(false);

      if (/iPhone/i.test(navigator.userAgent))
      setIsIphone(true)
    else
      setIsIphone(false);

  }

  const value = {
    userAgent,
    userAgentMobile,
    isAndroid,
    isIPhone
  }
  return (value)

}

export default MobileContext;


