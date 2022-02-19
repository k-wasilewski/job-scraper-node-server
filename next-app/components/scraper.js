import React, {useEffect, useState} from 'react';
import axios from "axios";

export default function Scraper() {
    const [html, setHtml] = useState('');
    const [intervalRef, setIntervalRef] = useState(Number);
    const site = 'https://www.google.com/search?q=fullstack+developer+warszawa';
    const [links, setLinks] = useState([]);

    useEffect(() => {
        const re = /href=\\"\/url\?q=(.*?)\\u/g;
        if (html) {
            let res;
            const l = [];
            while (res = re.exec(html)) {
                console.log(res)
                l.push(res[1])
            }
            setLinks(l);
        }
    }, [html]);

    useEffect(() => {
        const intR = setInterval(() => {
            getHtml();
        }, 5000);
        setIntervalRef(intR);
    }, []);

    useEffect(() => {
        if (html) {
            clearInterval(intervalRef);
        }
    }, [html]);

    const getHtml = () => {
        axios.get('http://www.whateverorigin.org/get?url=' +
            encodeURIComponent(site) +
            '&callback=?')
            .then(resp => setHtml(resp.data))
            .catch(e => console.warn('CORS error for ' + site + ', retrying...'));
    }

    return (
        <>{links ? links.map((link, i) => <p key={i}>{link}</p>) : <br/>}</>
    );
};