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
                    right: "btc",
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
                "currency_logoid",
                "name",
                "close|5",
                "SMA200|5",
                "SMA100|5",
                "SMA50|5",
                "RSI|5",
                "change|5",
                "high|5",
                "low|5",
            ],
            sort: {
                sortBy: "RSI|5",
                sortOrder: "asc",
            },
            range: [0],
        };
        axios
            .post("https://cors-anywhere.herokuapp.com/https://scanner.tradingview.com/crypto/scan", param)
            .then((res) => {
                const mapping = [];
                res.data.data.forEach((element) => {
                    let obj = {};
                    element.d.forEach((val, idx) => {
                        if (idx !== 0) {
                            obj[param.columns[idx]] = val;
                        }
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
                    column.slice(1).map((item) => {
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
                        if (data && data[x.tableData.id]["RSI|5"] < 30) {
                            return {
                                backgroundColor: "pink",
                            };
                        }
                    },
                }}
            />
        </>
    );
}

export default App;
