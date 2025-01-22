import React, {useMemo} from 'react';


// 
const Disclaimer = () => {
    var disclaimer  = useMemo(() => localStorage.getItem('disclaimer'), []);
    console.log ('disclaimer: ', disclaimer);

    if (disclaimer === null) {
        disclaimer = 0
    }
    if (disclaimer < 2) {

        disclaimer ++

        (localStorage.setItem('disclaimer', disclaimer))
        console.log ('disclaimer1: ', disclaimer);

        if (disclaimer > 2)
            return null
        return (
            <div>
                <div style={{ border: '2px solid red', background: '#FFf4f4'}}> 
                    <h1 style={{color: 'red'}}>Disclaimer</h1>
                    <hr/>
                    <h5>This web site is provided as is. No guarantee for accuracy.</h5>
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
                </div>
                <hr/>
            </div>
        );
    }
    else return null
};

export {Disclaimer}