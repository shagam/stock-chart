import React, {useState, useMemo, useEffect, Suspense, lazy} from 'react'


// new functionality
function News (props) {

    const NEWS = 'news';

    // const newsDefault = {
    //     option_mili: new Date().getTime()

    // }


    var news = JSON.parse(localStorage.getItem(NEWS))
    if (! news) {
        news = {init: new Date().getTime(), optionCount: 0};
        console.log (NEWS, news)
        localStorage.setItem(NEWS, JSON.stringify(news))
    }

 
    function news_Option () {
        news.option_mili = new Date().getTime()
        news.optionCount++
        localStorage.setItem(NEWS, JSON.stringify(news))
    }

  return (
    <div>
        {(props.eliHome && news.optionCount < 8) && <div style={{display: 'flex'}}>
            <div> New support page for  <strong style={{color:'green'}}>Call options</strong> &nbsp; &nbsp; </div>
            <a href="https://youtube.com/shorts/YnNDCs4sUyA" target="_blank" rel="noopener noreferrer">
                <b>Call Option Tutorial</b>
            </a>
            {/* { <a href={'https://youtube.com/shorts/YnNDCs4sUyA'}><b>'call option tutorial'</b> </a>} */}

            {news_Option ()}
        </div>}   
    </div>
  )
}

export {News}