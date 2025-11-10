import {useState, useEffect} from 'react';
import axios from "axios";

function useFetchProcessMetrics(url, interval = 3000) {
    const [consumption, setConsumption] = useState([]);
    const [hostname, setHostname] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        
        const fetchData = () => {
            axios.get(url)
            .then((res) => {
                const metrics = res.data;

                setConsumption(consump => [...consump, {
                    cpuUsage: metrics.cpuUsage,
                    ramUsage: metrics.memoryUsage,
                    timeStamp: new Date().toLocaleTimeString()
                }].slice(-40));
                
                setLoading(false);
            })
            .catch((err) => console.log(err));
        }

        fetchData();

        const id = setInterval(fetchData, interval);

        return () => {clearInterval(id);};

    }, [url, interval]);

    return {consumption, loading};

}
export default useFetchProcessMetrics;