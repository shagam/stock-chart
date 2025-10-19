import React, {useState, useMemo, useEffect, Suspense, lazy} from 'react'


// new functionality
function News (props) {

    const image_url = "https://"+props.corsServer + ":" + props.PORT + "/download?img=QQQ_call_options.jpg" 
    console.log (image_url)
    const [QQQ_call_option_image, setQQQ_call_ption_image] = useState(image_url) 
    const NEWS = 'news'; // localStorage file name

    // const newsDefault = {
    //     option_mili: new Date().getTime()

    // }


    var news = JSON.parse(localStorage.getItem(NEWS))
    if (! news) {
        news = {init: new Date().getTime(), optionCount: 0};
        console.log (NEWS, news)
        localStorage.setItem(NEWS, JSON.stringify(news))
    }

 
    function news_Option_increment_count () {
        news.option_mili = new Date().getTime()
        news.optionCount++
        localStorage.setItem(NEWS, JSON.stringify(news))
    }

    function newsClear () {
        localStorage.removeItem(NEWS)
        window.location.reload()
    }

  return (
    <div>
        {props.eliHome && <button onClick={() => newsClear()}> news-rfresh </button> } 
        {(props.eliHome && news.optionCount < 8) && <div style={{ border:'2px solid magenta'}}>
            <div>
                <hr/> 
                < h5> &nbsp; Update: New page  <strong style={{color:'magenta'}}>Call options</strong> &nbsp; &nbsp; </h5>
                <hr/>

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

                {news_Option_increment_count ()}

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