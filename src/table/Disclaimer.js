import React, {useMemo} from 'react';
import {getDate} from '../utils/Date'

// 
const Disclaimer = (props) => {
    const log = props.logFlags.includes('aux')
    var disclaimer  = useMemo(() => localStorage.getItem('disclaimer'), []);

    if (disclaimer === null || disclaimer === 'undefined') 
        disclaimer = {count: 0, date: getDate()}
    else if (disclaimer === 2)
        disclaimer = {count: 2, date: getDate()}        
    else
        disclaimer = JSON.parse(disclaimer)

    if (disclaimer.count < 2) {
        disclaimer.count ++

        localStorage.setItem('disclaimer', JSON.stringify(disclaimer))
        if (log)
            props.eliHome && console.log ('disclaimer1: ', disclaimer);

        if (disclaimer.count > 2)
            return null
        return (
            <div>
                {disclaimer.count === 2 && <div style={{ border: '2px solid red', background: '#FFf4f4'}}> 
                    <h1 style={{color: 'red'}}>Disclaimer</h1>
                    <hr/>
                    <h5>This web site is provided as is.</h5>
                    <h5>We do our best to provide accurate info. No guarantee.</h5>
                    <h5>Please review other sites, before taking an investment decision.</h5>
                    <div>&nbsp;</div>
                    <h5>This site uses local-storage for persistency.</h5>
                    <h5>This site saves info in common backend to facilitate some mechanisms. </h5>
                    <h5>Info is not shared with third parties.</h5>
                    <div>&nbsp;</div>
                    <h5 style={{color: 'green'}}>This site is free. Please share on social media.</h5>                    
                    <div>&nbsp;</div>
                    <h6>This disclaimer appears once in a while on each platform/browser</h6>
                    <h6>Reload page to clear</h6>
                </div>}
                <hr/>
            </div>
        );
    }
    else return null
};

function disclaimerPurge() {
    localStorage.removeItem('disclaimer')
}

function getDisclaimerDate() {
    var disclaimer = localStorage.getItem('disclaimer')
    disclaimer = JSON.parse(disclaimer)
    return disclaimer.date;
}

export {Disclaimer, disclaimerPurge, getDisclaimerDate}