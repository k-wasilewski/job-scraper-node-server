import React, {useEffect} from "react";
import {useSubscription} from '@apollo/react-hooks';
import {fListData} from "./requests";

const Subscription = () => {
    const {data, loading} = useSubscription(fListData);

    useEffect(() => {
        console.log(data, loading)
    }, [data, loading]);

    return (
        <>

        </>
    )
}

export default Subscription;