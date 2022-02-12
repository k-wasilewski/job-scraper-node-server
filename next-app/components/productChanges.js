import React, {useState} from 'react';
import {useSubscription} from "@apollo/client";
import {gql} from "@apollo/client";

const SUBSCRIBE_TO_CHANGES = gql`
    subscription Subscription {
        productChanges
    }
`;

export default function ProductChanges() {
    const { data, loading } = useSubscription(
        SUBSCRIBE_TO_CHANGES
    );

    const [changes, setChanges] = useState([]);

    if (data && !changes.includes(data.productChanges)) setChanges(prevNews => [...prevNews, data.productChanges]);

    return (loading ? <h4>Loading...</h4> : <h4>{changes.map((c, i) => (
        <>{c}<br/></>
    ))}</h4>);
};