import "./main.css";
import useFetchSystemMetrics from "../modules/fetchSystemMetrics";
import {
  Line, Area, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer,
  ComposedChart
} from "recharts";

const URL_API = "http://localhost:5000/api/metrics";

function System() {

    const {metrics, loading} = useFetchSystemMetrics(`${URL_API}/system`);

    if (loading) return <div className="backgrnd"><h2>Loading ...</h2></div>

    let partitions = [];
    for (let p of metrics.partitions) {
        partitions.push(
            <div>
                <div className="sys-info-field"><p className="field-lbl">Device : </p><p className="field-val"><b>{p.device}</b></p></div>
                <div className="sys-info-field"><p className="field-lbl">Mount Point : </p><p className="field-val"><b>{p.mountpoint}</b></p></div>
                <div className="sys-info-field"><p className="field-lbl">File System : </p><p className="field-val"><b>{p.fs}</b></p></div>
                <div className="sys-info-field"><p className="field-lbl">Device : </p><p className="field-val"><b>{p.device}</b></p></div>
                <div className="sys-info-field"><p className="field-lbl">Size : </p><p className="field-val"><b>{bytesToStr(p.size)}</b></p></div>
                <div className="sys-info-field"><p className="field-lbl">Used : </p><p className="field-val"><b>{bytesToStr(p.used)}</b></p></div>
                <div className="sys-info-field"><p className="field-lbl">Total Read : </p><p className="field-val"><b>{bytesToStr(p.total_read)}</b></p></div>
                <div className="sys-info-field"><p className="field-lbl">Total Write : </p><p className="field-val"><b>{bytesToStr(p.total_write)}</b></p></div>
                <hr/>
            </div>
        )
    }
    
    return (
        <div className="backgrnd">
            <div className="page">
                <h1 className="page-title">System Details of {metrics.hostname}</h1>
                
                <div className="graph">
                    <h2 className="section-title">Battery Evolution</h2>
                    <ResponsiveContainer>
                        <ComposedChart data={metrics.battery_data}>
            
                            <defs>
                                <linearGradient id="gradCharge" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#4caf50" stopOpacity={0.5}/>
                                    <stop offset="100%" stopColor="#4caf50" stopOpacity={0}/>
                                </linearGradient>
                                <linearGradient id="gradDischarge" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#ff6b6b" stopOpacity={0.5}/>
                                    <stop offset="100%" stopColor="#ff6b6b" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
            
                            <CartesianGrid strokeDasharray="3 3"/>
                            <XAxis dataKey="record_time" />
                            <YAxis domain={[0, 100]} />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" unit="%" dataKey="battery_charging" stroke="#4caf50" correctNulls={false} strokeWidth={2} dot={false} name="Charging"/>
                            <Area type="monotone" fill="url(#gradCharge)" dataKey="battery_charging" correctNulls={false} stroke="none" legendType="none"/>
                            <Line type="monotone" unit="%" dataKey="battery_decrease" stroke="#ff6b6b" correctNulls={false} strokeWidth={2} dot={false} name="On battery"/>
                            <Area type="monotone" fill="url(#gradDischarge)" dataKey="battery_decrease" correctNulls={false} stroke="none" legendType="none"/>
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>

                <h3>PC : </h3>
                <div className="sys-info-field"><p className="field-lbl">OS : </p><p className="field-val"><b>{metrics.os}</b></p></div>
                <div className="sys-info-field"><p className="field-lbl">Release : </p><p className="field-val"><b>{metrics.release}</b></p></div>
                <div className="sys-info-field"><p className="field-lbl">Version : </p><p className="field-val"><b>{metrics.version}</b></p></div>
                <div className="sys-info-field"><p className="field-lbl">Architecture : </p><p className="field-val"><b>{metrics.architecture}</b></p></div>
                <div className="sys-info-field"><p className="field-lbl">Processor : </p><p className="field-val"><b>{metrics.processor}</b></p></div>
                <div className="sys-info-field"><p className="field-lbl">Memory : </p><p className="field-val"><b>{bytesToStr(metrics.ram)}</b></p></div>
                <hr/>
                <h3>Partitions : </h3>
                {partitions}
            </div>
        </div>
    );
}

function bytesToStr(bytes) {
    let div = Math.pow(2, 40);
    const arr = ["TB", "GB", "MB", "kB", "B"];
    let buffer = "";
    for (let order of arr) {
        if (bytes >= div) {
            const val = parseInt(bytes / div);
            buffer += `${val}${order} `;
            bytes -= val * div;
        }

        div /= Math.pow(2, 10);
    }
    return buffer;
}

export default System;