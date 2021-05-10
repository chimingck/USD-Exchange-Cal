import './App.css';
import {useEffect, useState} from "react";
import axios from "axios";

function App() {
  const [exchangeRates, setExchangeRates] = useState([]);
  const [exchangeRatesHist, setExchangeRatesHist] = useState([]);
  const [passSevenDays, setPassSevenDay] = useState([])
  const [exchangeOptions, setExchangeOptions] = useState([]);
  const [currency, setCurrency] = useState('');

  const [exchangeInput, setExchangeInput] = useState(0);
  const [exchangeOutput, setExchangeOutput] = useState(0);

  const appId = "5823deafadd54a4a9be7ee2b685b0a24";

  useEffect(() => {
    // latest exchange rates
    axios.get(`https://openexchangerates.org/api/latest.json?app_id=${appId}`)
    .then((response)=>{
      // console.log("Response:", response);
      if (response && response.data) {
        setExchangeRates(response.data.rates);
        setExchangeOptions(Object.keys(response.data.rates))
        setCurrency('HKD')
        // console.log(exchangeRates);

      } else {
        console.log("error! can't get the exchange rate info")
      }

    });

    async function fetchHistoricalRates() {
      // exchange rates in pass 7 days
      var passDays = [];
      for (var i = 1; i <= 7; i++) {
          var d = new Date();
          d.setDate(d.getDate() - i);
          passDays.push( d.toISOString().slice(0, 10) );
      }
      setPassSevenDay(passDays);
      // console.log(passSevenDates);
      var newExchangeRateHist = new Array(7);
      for (i = 0; i < 7; i++) {
        const response = await axios.get(`https://openexchangerates.org/api/historical/${passDays[i]}.json?app_id=${appId}`)
        if (response && response.data) {
          newExchangeRateHist[i] = response.data.rates;
        } else {
          console.log(`error! can't get the exchange rate info of ${i+1} day before`)
        }
      }
      setExchangeRatesHist(newExchangeRateHist);
      // console.log(newExchangeRateHist)
    }
    fetchHistoricalRates();

  }, []);

  const handleOnCurrencyChange = (event) => {
    const curr = event.target.value;
    setCurrency(curr);
    setExchangeOutput(exchangeInput*exchangeRates[curr]);
  }

  const handleOnUsdInputChange = (event) => {
    if (event.target.validity.valid)
      setExchangeInput(event.target.value);

    const input = parseFloat(event.target.value);
    if (!isNaN(input)) {
      // display at most 10 decimal numbers
      setExchangeOutput(+(Math.round((input*exchangeRates[currency]) + "e+10")  + "e-10"));
    }
  }

  const handleOnOutputChange = (event) => {
    if (event.target.validity.valid)
      setExchangeOutput(event.target.value);

    const output = parseFloat(event.target.value);
    if (!isNaN(output)) {
      // display at most 10 decimal numbers
      setExchangeInput(+(Math.round((output/exchangeRates[currency]) + "e+10")  + "e-10"));
    }
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>USD Exchange Calculator</h1>
      </header>

      <section className="calculator">
        <div className="row">
          <div className="column">
            <h1 className="symbol">USD</h1>
            <input
              type="text"
              name="usd-input"
              id="usd-input"
              value={exchangeInput}
              onChange={handleOnUsdInputChange}
              pattern="^-?[0-9]\d*\.?\d*$"
            />
          </div>

          <div className="exchange-symbol">
            <p>⇌</p>
          </div>

          <div className="column">
            <select
              name="target-currency"
              id="target-currency"
              onChange={handleOnCurrencyChange}
              value={currency}
            >
              { exchangeOptions.map((sym) => { return <option value={sym} key={sym} >{sym}</option> }) }
            </select>
            <input
              type="text"
              name="target-currency-input"
              id="target-currency-input"
              value={exchangeOutput}
              onChange={handleOnOutputChange}
              pattern="^-?[0-9]\d*\.?\d*$"
            />
          </div>
        </div>

        <div className="exchange-rate">
          <h1>Exchange rate: {exchangeRates ? exchangeRates[currency] : ''}</h1>
        </div>

      </section>


      <section className="historical">
        <h1>Weekly Historical Exchange Rates</h1>
        <table className="historical-rates">
          <tbody>
            <tr>
              <th className="historical-date">Date</th>
              <th className="historical-rate">Exchange Rate</th>
            </tr>
            {
              exchangeRatesHist.map((rate, i) => { return (
                  <tr key={i}>
                    <td>{passSevenDays[i]}</td>
                    <td>{rate[currency]}</td>
                  </tr>
              ) })
            }
          </tbody>
        </table>
      </section>
    </div>
  );
}

export default App;
