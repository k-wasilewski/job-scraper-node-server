import React, {useState} from 'react';
import {useSubscription} from "@apollo/client";
import {gql} from "@apollo/client";

// @ts-ignore
const SUBSCRIBE_TO_SCRAPES_PERFORMED = gql`
    subscription Subscription {
        scrapesPerformed
    }
`;

export default function SpringServerHealthcheck() {
    const { data, loading } = useSubscription(
        SUBSCRIBE_TO_SCRAPES_PERFORMED
    );

    const [timestamps, setTimestamps] = useState([]);

    if (data && !timestamps.includes(data.scrapesPerformed)) setTimestamps(prevScrapes => [...prevScrapes, data.scrapesPerformed]);

    return loading ?
        <h4>Loading...</h4>
        :
        <h4>
            {timestamps.map((timestamp, i) => (
                <div key={i}>
                    {timestamp}
                    <br/>
                </div>
            ))}
        </h4>;
};