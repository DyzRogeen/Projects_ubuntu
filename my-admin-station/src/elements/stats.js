import "./main.css";
import "../modules/fetchProcessMetrics.jsx";
import useFetchProcessMetrics from "../modules/fetchProcessMetrics.jsx";
import useFetchProcesses from "../modules/fetchProcesses.jsx";
import {
  ComposedChart, Line, Area, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer
} from "recharts";
import React, {useState, } from 'react';
import { AiFillFileExclamation, AiFillCloseCircle } from "react-icons/ai";
import axios from "axios";

const URL_API = "http://localhost:5000/api/metrics";

function Stats() {

    const [sortConfig, setSortConfig] = useState({key : null, direction: -1 });
    const [nbElem, setNbElem] = useState(20);
    const [searchedProcess, setSearchedProcess] = useState("");
    const [openDialog, setOpenDialog] = useState(false);
    const [processInfo, setProcessInfo] = useState({});

    const {consumption, loading} = useFetchProcessMetrics(`${URL_API}/processes/metrics`, 3000); 
    const processes = useFetchProcesses(`${URL_API}/processes`, 15000)

    let totalCPU = parseInt(processes.reduce((n, proc) => n + proc.cpu_percent, 0) / 100);
    let totalRAM = parseInt(processes.reduce((n, proc) => n + proc.memory_percent, 0));

    const processRows = React.useMemo(() => {
        let key = sortConfig.key;
        let toSort = [...processes];

        if (searchedProcess !== "")
            toSort = toSort.filter((p) => p.name.toUpperCase().indexOf(searchedProcess.toUpperCase()) >= 0);

        if (key === null) key = "pid";
        if (sortConfig.direction === 1) toSort.sort((a, b) => key === "name" ? ('' + a[key]).localeCompare(b[key]) : a[key] - b[key]);
        else toSort.sort((a, b) => key === "name" ? ('' + b[key]).localeCompare(a[key]) : b[key] - a[key]);
        
        let rows = []
        toSort.slice(0, nbElem).forEach(process => {
            rows.push(
                <tr>
                    <td>{process.pid}</td>
                    <td>{process.name}</td>
                    <td>{parseInt(process.cpu_percent)/100}</td>
                    <td>{parseInt(process.memory_percent)}</td>
                    <td class="action-td">
                        <div onClick={() => getProcessInfos(process.pid)} type="button" className="action-btn info-btn"><AiFillFileExclamation size={25} className="btn-icon"/></div>
                        <div onClick={() => killProcess(process.pid)} type="button" className="action-btn delete-btn"><AiFillCloseCircle size={25} className="btn-icon"/></div>
                    </td>
                </tr>
            );
        });
        return rows;

    }, [processes, sortConfig, nbElem, searchedProcess]);

    const updateConfig = (key) => {
        if (sortConfig.key === key && sortConfig.direction === 1) setSortConfig({key : key, direction: -1 });
        else setSortConfig({key : key, direction: 1 });
    }

    const getProcessInfos = (pid) => {
        axios.get(`${URL_API}/processes/${pid}`)
        .then((infos) => {
            setOpenDialog(true);
            setProcessInfo(infos.data);
        })
        .catch((e) => console.log(e));
    }

    const killProcess = (pid) => {
        if (!window.confirm(`Do you really want to kill process ${pid} ?`)) return;

        axios.delete(`${URL_API}/processes/${pid}`)
        .then(() => {
            const proc = processes.find((p) => p.pid === pid);
            processes.remove(proc);
        })
        .catch((e) => console.log(e));
    }
    
    if (loading) return <div className="backgrnd"><h2>Loading ...</h2></div>

    return (
        <div className="backgrnd">
            <div className="page">

                <h1 className="page-title">Statistics</h1>

                <div className="graph">
                    <h2 className="section-title">CPU and RAM Consumption</h2>
                    <ResponsiveContainer>
                        <ComposedChart data={consumption}>

                            <defs>
                                <linearGradient id="cpuGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#e3956bff" stopOpacity={0.4} />
                                <stop offset="100%" stopColor="#e3956bff" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="ramGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#82ca9d" stopOpacity={0.4} />
                                <stop offset="100%" stopColor="#82ca9d" stopOpacity={0} />
                                </linearGradient>
                            </defs>

                            <CartesianGrid strokeDasharray="3 3"/>
                            <XAxis dataKey="timeStamp" />
                            <YAxis domain={[0, 100]} />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="cpuUsage" stroke="#e3956bff" strokeWidth={2} dot={false} isAnimationActive={false} name="CPU (%)"/>
                            <Area type="monotone" fillOpacity={1} fill="url(#cpuGradient)" dataKey="cpuUsage" stroke={false} strokeWidth={2} dot={false} isAnimationActive={false} legendType="none"/>
                            <Line type="monotone" dataKey="ramUsage" stroke="#82ca9d" strokeWidth={2} dot={false} isAnimationActive={false} name="RAM (%)"/>
                            <Area type="monotone" fillOpacity={1} fill="url(#ramGradient)" dataKey="ramUsage" stroke={false} strokeWidth={2} dot={false} isAnimationActive={false} legendType="none"/>
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
                
                <div>
                    <h2 className="section-title">List of processes</h2>
                    <div className="search-div">
                        <p>Search process :</p>
                        <input className="search-bar" type="text" onChange={(e) => setSearchedProcess(e.target.value)}/>
                    </div>
                    <table className="custom-table">
                        <thead><tr>
                            <th style={{width: "60px"}} onClick={() => {updateConfig("pid")}}>PID</th>
                            <th onClick={() => {updateConfig("name")}}>name</th>
                            <th style={{width: "80px"}} onClick={() => {updateConfig("cpu_percent")}}>CPU (%)</th>
                            <th style={{width: "80px"}} onClick={() => {updateConfig("memory_percent")}}>RAM (%)</th>
                            <th style={{width: "85px"}}>Action</th>
                        </tr></thead>

                        <tbody>{processRows}</tbody>
                        
                        <tfoot><tr>
                            <td colspan="2">Nb elem : <input id="nb-elem-input" className="search-bar" type="number" value={nbElem} onChange={(e) => setNbElem(e.target.value)}/></td>
                            <td>Total {totalCPU}%</td><td>Total {totalRAM}%</td><td></td>
                        </tr></tfoot>
                    </table>
                </div>
            </div>
            <ProcessInfoDialog open={openDialog} close={() => setOpenDialog(false)} processInfo={processInfo} />
        </div>
    );

}
export default Stats

function ProcessInfoDialog({open, close, processInfo}) {
    if (!open) return null;

    let parents = [];
    for (let p of processInfo.parents) {
        parents.push(formatRelative(p));
    }
    let children = [];
    for (let p of processInfo.children) {
        children.push(formatRelative(p));
    }

    return (
        <div className="dialog-bg">
            <div className="dialog-box">
                <h3 className="section-title">Process Details</h3>
                <div className="dialog-field"><p className="field-lbl">PID :</p><p className="field-val"><b>{processInfo.pid}</b></p></div>
                <div className="dialog-field"><p className="field-lbl">Name :</p><p className="field-val"><b>{processInfo.name}</b></p></div>
                <div className="dialog-field"><p className="field-lbl">exe :</p><p className="field-val"><b>{processInfo.exe}</b></p></div>
                <div className="dialog-field"><p className="field-lbl">Status :</p><p className="field-val"><b>{processInfo.status}</b></p></div>
                <div className="dialog-field"><p className="field-lbl">Started :</p><p className="field-val"><b>{processInfo.started}</b></p></div>
                <div className="dialog-field"><p className="field-lbl">Memory :</p><p className="field-val"><b>{processInfo.memory}</b></p></div>
                <div className="dialog-field"><p className="field-lbl">CPU :</p><p className="field-val"><b>{processInfo.cpu}</b></p></div>
                <div className="dialog-field"><p className="field-lbl">User :</p><p className="field-val"><b>{processInfo.user}</b></p></div>
                <hr/>
                <h3 className="section-title" style={{margin: 0}}>Process Parents</h3>
                {parents}
                <hr/>
                <h3 className="section-title" style={{margin: 0}}>Process Children</h3>
                {children}
                <hr/>
                <input className="btn dialog-btn" type="button" onClick={close} value="ok" />
            </div>
        </div>
    );
}

function formatRelative(p) {
    return (
        <div className="dialog-row">
            <p className="field-lbl">PID :</p><p className="field-val"><b>{p.pid}</b></p>
            <p className="field-lbl">Name :</p><p className="field-val"><b>{p.name}</b></p>
            <p className="field-lbl">Status :</p><p className="field-val"><b>{p.status}</b></p>
            <p className="field-lbl">Started :</p><p className="field-val"><b>{secondsToStr(p.started)}</b></p>
        </div>
    );
}

function secondsToStr(time) {
    var date = new Date(time * 1000);
    return date.toISOString().split("T")[1].split(".")[0];
}