import React, {useEffect, useState} from 'react';
import axios from "axios";

export default function Scraper(props) {
    const [html, setHtml] = useState('');
    const [intervalRef, setIntervalRef] = useState(Number);
    const [occurances, setOccurances] = useState(-1);

    useEffect(() => {
        const intR = setInterval(() => {
            getHtml();
        }, 5000);
        setIntervalRef(intR);
    }, []);

    useEffect(() => {
        if (html) {
            clearInterval(intervalRef);
            setOccurances(countOccurances(html, props.word));
        }
    }, [html]);

    const countOccurances = (string, substring) => {
        return string.split(substring).length - 1;
    }

    const getHtml = () => {
        axios.get('http://www.whateverorigin.org/get?url=' +
            encodeURIComponent(props.site) +
            '&callback=?')
            .then(resp => setHtml(resp.data))
            .catch(e => console.warn('CORS error for ' + props.site + ', retrying...'));
    }

    return (
      <p>{occurances}</p>
    );
};