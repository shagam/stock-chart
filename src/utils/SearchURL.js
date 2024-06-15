import React, {useState} from 'react'
import axios from 'axios'

// used for testing axios use
function searchURL (logFlags) {
    const mili = Date.now();

    if (mili % 113 !== 0 || true) // block rare access to search
        return;

    const LOG = logFlags.includes('splits');

    var url = 'https://www.google.com/search?q=stocks-compare.netlify.app'
    if (LOG)
        console.log (url)
    axios.get (url)
    .then ((result) => {
    if (result.status !== 200)
        return;
    console.log (result.data)
    })
    .catch ((err) => {
        // setError([err.message, url])
        if (LOG)
            console.log(err.message, url) //  has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.
    })
}

export default searchURL

