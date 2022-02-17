import React, {useState} from 'react'

import {collection, getDocs} from "firebase/firestore";



function Ip (props) {

  const [ipList, setIpList] = useState ([]);
  const [ipDisplayFlag, setIpDisplayFlag] = useState(false);
  const [ipListFormatted, setIpListFormated] = useState ([]);

  const ipRef = collection(props.db, "ipList")

  if (! props.admin && props.localIp.IPv4 !== '10.120.250.135')
    return null;



  const LOG_FLAG = false;

  const ipFireGet = async () => {
    var ipTable = "";
    var ipListCollect = [];
    setIpList ([]);
    const ipReadList = await getDocs(ipRef)
    for (let i = 0; i < ipReadList.docs.length; i++) {
      if (LOG_FLAG)
      console.log (ipReadList.docs[i].data());
      const index = ipList.findIndex((ip) => ip._ipv4 === ipReadList.docs[i].data().ipv4);
      if (index === -1) {// not found
        //ipList.push (ipReadList.docs[i].data());
        ipListCollect.push (ipReadList.docs[i].data());
        ipTable += JSON.stringify(ipReadList.docs[i].data()) + "\n\n";
      }
    }
    setIpListFormated(ipTable);
    setIpList (ipListCollect);
  }

  
  const collect_ip = () => {
    ipFireGet();
  }

  
  localStorage.setItem ('ipList', JSON.stringify(ipList));

  const ipDisplayChange = () => {setIpDisplayFlag (! ipDisplayFlag)}


  return (
    <>
      <div id = 'ip_diaspay_Checkbox'>
          <input type="checkbox" checked={ipDisplayFlag}  onChange={ipDisplayChange} /> ip-display
      </div>

      {ipDisplayFlag && <div>

        <div id="ip_diaplay">
          <label>  ip info: {props.localIp.IPv4}, ipList: {ipList.length} </label>
          <button type="button" onClick={()=>collect_ip()}>get IP    </button>
        </div>

        <div className='text'> 
          <textarea
            type='text'
            name='ipList'
            cols='200'
            rows='20'
            readOnly
            defaultValue={ipListFormatted}
          >
          </textarea>
        </div>
        
      </div>
    }
    </>
  )
}

export default Ip



