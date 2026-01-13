import React, {useState, useMemo, useEffect, Suspense, lazy} from 'react'
import {todaySplit, todayDate, todayDateSplit, dateSplit, monthsBack, daysBack, compareDate, daysFrom1970, 
  searchDateInArray, monthsBackTest, daysBackTest, getDate, getDateSec, dateStr} from '../utils/Date'

// new functionality
function News (props) {

    const image_url = "https://"+props.corsServer + ":" + props.PORT + "/download?img=QQQ_call_options.jpg" 
    console.log (image_url)
    const [QQQ_call_option_image, setQQQ_call_ption_image] = useState(image_url) 
    const NEWS = 'news'; // localStorage file name
    const [newEvent, setNewEvent] = useState ({ })


    useEffect(() => {
        const NEWS = 'news';
        var news
        var change = false;
        const news_ = localStorage.getItem(NEWS)
        if (news_)
            news = JSON.parse(news_)
        else {
            news = {}  
            change = true;
        }
        


        if (! news.options_date) {
            news.options_date = getDate()
            console.log(getDate(), "Running initialization, count =", news.options_date);
            change = true;
            newEvent.options = true

        }

        if (change) {
            localStorage.setItem(NEWS, JSON.stringify(news));
        }

    }, [newEvent]);

    function newsClear () {
        localStorage.removeItem(NEWS)
        window.location.reload()
    }

  return (
    <div>
        {props.eliHome && <button onClick={() => newsClear()}> news-rfresh </button> } 
        {props.eliHome && newEvent.options && <div style={{ border:'2px solid magenta'}}>
            <div>
                <hr style={{ border: '3px solid #000000'}}/> 
                < h5> &nbsp; Update: New page  <strong style={{color:'magenta'}}>Call options</strong> &nbsp; &nbsp; </h5>
                <hr style={{ border: '3px solid #000000'}}/> 

                {/* // If image is in public folder */}
                {/* <h5>Call option page example </h5>
                <img src="/QQQ_call_options.jpg" alt="QQQ_call_options" /> */}


                {/* <img src="http://localhost:3001/image/QQQ_call_options.jpg" alt="Server Image" /> */}
                <img src={QQQ_call_option_image} alt="QQQ_call_options__" />

                {/* call option tutorial */}
                <div> &nbsp;</div>
                <a href="https://youtube.com/shorts/YnNDCs4sUyA" target="_blank" rel="noopener noreferrer">
                    <b> Call-Option-Tutorial</b>
                </a>
        
                <div> &nbsp;</div>
                <button onClick={() => window.location.reload()}> <strong style={{color: 'turquoise'}}>abort-page</strong> </button> 



                {/*
                // If image is imported from src
                import myImage from './assets/my-image.jpg';
                <img src={myImage} alt="My Image" /> */}

                <hr/> 
            </div>
        </div>} 
 
    </div>
  )
}

export {News}