import React, {useState, useMemo, useEffect, Suspense, lazy} from 'react'
import {IpContext} from '../contexts/IpContext';
import { ComboBoxSelect } from '../utils/ComboBoxSelect'
import { AuthProvider, useAuth } from '../contexts/AuthContext';

const PORT = 5000

var server
const ssl = true;
function ServerSelect () {
    const {localIp, localIpv4, eliHome, city, countryName, countryCode, regionName, ip, os} = IpContext();
   
    const servList = [process.env.REACT_APP_AWS_IP, process.env.REACT_APP_LOCAL_SERV_IP];
    const servNameList = ['production', 'test'];
    const [servSelect, setServSelect] = useState(servList[0]);
    const [ssl, setSsl] = useState(true)
    const { login, currentUser, admin } = useAuth();

   

    server = servSelect;
    return (
        <div>
            {eliHome && <div style={{display:'flex'}}> <ComboBoxSelect serv={servSelect} nameList={servNameList} setSelect={setServSelect} 
            title='backEndServer' options={servList} defaultValue={servSelect}/> </div>}            

            {admin && <div> &nbsp; <input  type="checkbox" checked={ssl}  onChange={() => {setSsl (! ssl)}} /> ssl &nbsp;&nbsp;</div>} 
        </div>
    )
}

export {ServerSelect, server, PORT, ssl}