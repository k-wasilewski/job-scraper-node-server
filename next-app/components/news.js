import React, {useState} from 'react';
import {useSubscription} from "@apollo/client";
import {gql} from "@apollo/client";

const SUBSCRIBE_TO_NEWS = gql`
  subscription Subscription {
      news {
        content
      }
    }
`;

export default function News() {
    const { data, loading } = useSubscription(
        SUBSCRIBE_TO_NEWS
    );

    const [news, setNews] = useState([]);

    if (data && !news.includes(data.news.content)) setNews(prevNews => [...prevNews, data.news.content]);

    return (loading ? <h4>Loading...</h4> : <h4>{news.map((n, i) => (
        <>{n}<br/></>
        ))}</h4>);
};