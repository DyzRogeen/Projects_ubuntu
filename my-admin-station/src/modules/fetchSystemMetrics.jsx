import {useState, useEffect} from 'react';
import axios from "axios";

function useFetchSystemMetrics(url) {
    const [metrics, setMetrics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        axios.get(url)
        .then(res => {
            const data = res.data.infos;
            const battery_data = [];

            var battery_stats = res.data.battery_stats;
            for (let b of battery_stats) {
                const record_time = b.record_time.split("T")[1].split(".")[0];
                if (b.charging)
                    battery_data.push({record_time: record_time, battery_charging: b.percents, battery_decrease: null});
                else
                    battery_data.push({record_time: record_time, battery_charging: null, battery_decrease: b.percents});
            }

            data.battery_data = battery_data;

            setMetrics(data);
            setLoading(false);
        })
        .catch(e => console.error(e));

    }, [url]);

    return {metrics, loading};
}

export default useFetchSystemMetrics;