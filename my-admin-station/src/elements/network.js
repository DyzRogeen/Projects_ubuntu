import './main.css'
import useFetchNetwork from '../modules/fetchNetwork.jsx'
import React, {useState} from 'react';
import { AiFillPlayCircle, AiFillStop } from 'react-icons/ai';

const URL_API = "http://localhost:5000/api/metrics/network";

function Network() {

    const [sortFlowsConfig, setSortFlowsConfig] = useState({key: null, direction: -1})
    const [sortPktsConfig, setSortPktsConfig] = useState({key: null, direction: -1})
    const [stopSniff, setstopSniff] = useState(true);

    let ndata = useFetchNetwork(URL_API, 2000, stopSniff);

    const sortedFlows = React.useMemo(() => {

        let key = sortFlowsConfig.key;
        const dir = sortFlowsConfig.direction;

        let items = [...ndata.flows];

        if (key == null) key = "bytes";

        let isStr = ["src", "dst"].includes(key);
        if (dir == 1) items.sort((a, b) => isStr ? ('' + a[key]).localeCompare(b[key]) : a[key] - b[key])
        else          items.sort((a, b) => isStr ? ('' + b[key]).localeCompare(a[key]) : b[key] - a[key])

        const rows = [];
        for (let flow of items) {
            rows.push(
                <tr>
                    <td>{flow.src}:{flow.sport}</td>
                    <td>{flow.dst}:{flow.dport}</td>
                    <td>{flow.count}</td>
                    <td>{bytesToStr(flow.bytes)}</td>
                    <td>{secondsToStr(flow.first)}</td>
                    <td>{secondsToStr(flow.last)}</td>
                </tr>
            )
        }

        return rows;

    }, [ndata, sortFlowsConfig])

    const sortedPkts = React.useMemo(() => {

        let key = sortPktsConfig.key;
        const dir = sortPktsConfig.direction;

        let items = [...ndata.list];

        if (key == null) key = "ts";

        let isStr = ["src", "dst", "l4"].includes(key);
        if (dir == 1) items.sort((a, b) => isStr ? ('' + a[key]).localeCompare(b[key]) : a[key] - b[key])
        else          items.sort((a, b) => isStr ? ('' + b[key]).localeCompare(a[key]) : b[key] - a[key])

        const rows = [];
        for (let pkt of items) {
            rows.push(
                <tr>
                    <td>{pkt.src}:{pkt.sport}</td>
                    <td>{pkt.dst}:{pkt.dport}</td>
                    <td>{pkt.l4}</td>
                    <td>{bytesToStr(pkt.length)}</td>
                    <td>{secondsToStr(pkt.ts)}</td>
                </tr>
            )
        }

        return rows;

    }, [ndata, sortPktsConfig])

    const play_pause_btn = React.useMemo(() => {
        if (stopSniff) return (<div onClick={() => setstopSniff(false)} type="button" className="action-btn play-btn"><AiFillPlayCircle size={25} className="btn-icon"/></div>);
        return (<div onClick={() => setstopSniff(true)} type="button" className="action-btn delete-btn"><AiFillStop size={25} className="btn-icon"/></div>);
    }, [stopSniff]);

    const updateSortFlowsConfig = (key) => {
        if (key === sortFlowsConfig.key) setSortFlowsConfig({key: key, direction: sortFlowsConfig.direction * -1});
        else                             setSortFlowsConfig({key: key, direction: sortFlowsConfig.direction});
    }

    const updateSortPktsConfig = (key) => {
        if (key === sortPktsConfig.key) setSortPktsConfig({key: key, direction: sortPktsConfig.direction * -1});
        else                            setSortPktsConfig({key: key, direction: sortPktsConfig.direction});
    }

    return (
        <div className="backgrnd">
            <div className="page">

                <h1 className="page-title">Network</h1>

                {play_pause_btn}
                
                <div>
                    <h2 className="section-title">List of flows</h2>
                    <table className="custom-table">
                        <thead><tr>
                            <th onClick={() => {updateSortFlowsConfig("src")}}>Source</th>
                            <th onClick={() => {updateSortFlowsConfig("dst")}}>Destination</th>
                            <th style={{width: "65px"}} onClick={() => {updateSortFlowsConfig("count")}}>Count</th>
                            <th style={{width: "100px"}} onClick={() => {updateSortFlowsConfig("bytes")}}>Load</th>
                            <th style={{width: "65px"}} onClick={() => {updateSortFlowsConfig("first")}}>Since</th>
                            <th style={{width: "65px"}} onClick={() => {updateSortFlowsConfig("last")}}>Until</th>
                        </tr></thead>

                        <tbody className="table-data">{sortedFlows}</tbody>
                    </table>
                </div>

                <div>
                    <h2 className="section-title">List of Packets</h2>
                    <table className="custom-table">
                        <thead><tr>
                            <th onClick={() => {updateSortPktsConfig("src")}}>Source</th>
                            <th onClick={() => {updateSortPktsConfig("dst")}}>Destination</th>
                            <th style={{width: "65px"}} onClick={() => {updateSortPktsConfig("l4")}}>Proto.</th>
                            <th style={{width: "100px"}} onClick={() => {updateSortPktsConfig("length")}}>Load</th>
                            <th style={{width: "65px"}} onClick={() => {updateSortPktsConfig("ts")}}>At</th>
                        </tr></thead>

                        <tbody>{sortedPkts}</tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default Network

function strDateFmt(date) {
    return date.split("T")[1].split(".")[0];
}

function secondsToStr(time) {
    var date = new Date((time + 3600 * 4) * 1000);
    return date.toISOString().split("T")[1].split(".")[0];
}

function bytesToStr(bytes, limit=2) {
    let div = Math.pow(2, 40);
    let cnt = 0;
    const arr = ["TB", "GB", "MB", "kB", "B"];
    let buffer = "";
    for (let order of arr) {
        if (bytes >= div) {
            const val = parseInt(bytes / div);
            buffer += `${val}${order} `;
            bytes -= val * div;
            cnt++;
            if (cnt >= limit) return buffer;
        }

        div /= Math.pow(2, 10);
    }
    return buffer;
}