import React, {useState} from 'react';
import {useSubscription} from "@apollo/client";
import {gql} from "@apollo/client";

// @ts-ignore
const SUBSCRIBE_TO_NEWS = gql`
  subscription Subscription {
      newJobs {
        timestamp,
        link  
      }
    }
`;

export default function NodeServerHealthcheck() {
    const { data, loading } = useSubscription(
        SUBSCRIBE_TO_NEWS
    );

    const [jobs, setJobs] = useState([]);

    if (data && !jobs.includes(data.newJobs)) setJobs(prevJobs => [...prevJobs, data.newJobs]);

    return (loading ? <h4>Loading...</h4> : <h4>{jobs.map((n, i) => (
        <>{n.link}<br/>{n.timestamp}<br/></>
        ))}</h4>);
};