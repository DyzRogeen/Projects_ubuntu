import {useState, useEffect} from 'react';
import axios from "axios";

function useFetchNetwork(url, interval = 2000, clear) {
    const [network, setNetwork] = useState({"flows": [], "list": []});

    useEffect(() => {

        const fetchData = () => {
            axios.get(url)
            .then((res) => (setNetwork(res.data)))
            .catch((e) => console.error(e));
        }

        let id = null;

        if (clear) {
            clearInterval(id);
            axios.get(`${url}/stop`)
            .then(() => {})
            .catch((e) => console.error(e));
        }
        else       id = setInterval(fetchData, interval);

        return () => {clearInterval(id);}

    }, [url, interval, clear]);

    return network;
}
export default useFetchNetwork