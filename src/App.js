import { useEffect, useState } from "react";
import "./App.css";
import axios from "axios";
import MaterialTable from "material-table";

function App() {
    const [column, setColumn] = useState();
    const [data, setData] = useState();
    const [refresh, setRefresh] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    useEffect(() => {
        const timer = setTimeout(() => {
            setRefresh(!refresh);
        }, 30000);
        return () => clearTimeout(timer);
    }, [refresh]);
    useEffect(() => {
        setIsLoading(true);
        const param = {
            filter: [
                {
                    left: "RSI|5",
                    operation: "nempty",
                },
                {
                    left: "exchange",
                    operation: "equal",
                    right: "BINANCE",
                },
                {
                    left: "name,description",
                    operation: "match",
                    right: "/ bitcoin",
                },
            ],
            options: {
                lang: "en",
            },
            symbols: {
                query: {
                    types: [],
                },
                tickers: [],
            },
            columns: [
                "name",
                "close|5",
                "RSI|5",
                "RSI|1",
                "MACD.macd|5",
                "MACD.signal|5",
                "SMA200|5",
                "SMA100|5",
                "SMA50|5",
                "change|5",
                "high|5",
                "low|5",
            ],
            sort: {
                sortBy: "RSI|5",
                sortOrder: "desc",
            },
            range: [0],
        };
        axios
            .post("/crypto/scan", param)
            .then((res) => {
                const mapping = [];
                const macdIdx = param.columns.findIndex(
                    (item) => item === "MACD.macd|5"
                );
                const macdSignal = param.columns.findIndex(
                    (item) => item === "MACD.signal|5"
                );
                const bullishMacd = res.data.data.filter(
                    (item) => item.d[macdIdx] > item.d[macdSignal]
                );
                bullishMacd.forEach((element) => {
                    let obj = {};
                    element.d.forEach((val, idx) => {
                        obj[param.columns[idx]] = val;
                    });
                    mapping.push(obj);
                });
                setColumn(param.columns);
                setData(mapping);
                setIsLoading(false);
            })
            .catch((err) => console.log(err));
    }, [refresh]);
    return (
        <>
            <button onClick={() => setRefresh(!refresh)}>Refresh</button>
            <span>{isLoading ? "loading" : "loaded"}</span>
            <MaterialTable
                columns={
                    column &&
                    column.map((item) => {
                        return {
                            title: item,
                            field: item,
                        };
                    })
                }
                data={data && data}
                options={{
                    search: true,
                    paging: false,
                    rowStyle: (x) => {
                        if (
                            data &&
                            x &&
                            x?.tableData &&
                            x?.tableData?.id !== undefined &&
                            data[x.tableData.id] !== undefined
                        ) {
                            if (data[x.tableData.id]["RSI|5"] > 70) {
                                return {
                                    backgroundColor: "lightgreen",
                                };
                            } else if (data[x.tableData.id]["RSI|5"] < 30) {
                                return {
                                    backgroundColor: "pink",
                                };
                            }
                        }
                    },
                }}
            />
        </>
    );
}

export default App;
