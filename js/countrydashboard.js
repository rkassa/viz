function countryInit() {
  dataProvider = new DataProvider(
      'https://raw.githubusercontent.com/ghdsi/covid-19/master/');
  dataProvider.fetchCountryNames().
        then(dataProvider.fetchJhuData.bind(dataProvider)).
        then(dataProvider.loadCountryData.bind(dataProvider)).
        then(showCountryPage);
}

function showCountryPage(data) {
  const dash = document.getElementById('dash');
  const code = dash.getAttribute('c');
  const country = countries[code];
  // De-duplicate geoids and dates, in case the data isn't well organized.
  let geoids = new Set();
  let dates = new Set();
  for (let date in data) {
    dates.add(date);
  }
  dates = Array.from(dates).sort();

  let o = {'dates': dates};

  for (let i = 0; i < dates.length; i++) {
    const date = dates[i];
    for (let geoid in data[date]) {
      geoids.add(geoid);
    }
  }

  const geoidsArray = Array.from(geoids);
  for (let i = 0; i < geoidsArray.length; i++) {
    const g = geoidsArray[i];
    o[g] = [];
    for (let j = 0; j < dates.length; j++) {
      const date = dates[j];
      if (!isNaN(data[date][g])) {
        o[g].push(data[date][g]);
      } else {
        o[g].push(null);
      }
    }
  }

  let chartsEl = document.getElementById('charts');

  const columns = chartsEl.clientHeight < chartsEl.clientWidth;
  chartsEl.style.flexDirection = columns ? 'row' : 'column';
  let container = document.createElement('div');
  container.classList.add('chart');
  container.setAttribute('id', 'new');
  container.innerHTML = '';
  Graphing.makeCasesGraph(o, true /* useAverageWindow */, container);
  chartsEl.appendChild(container);

  o = {'dates': dates};
  const centroidGeoid = country.getCentroid().join('|');
  const aggregateData = dataProvider.getAggregateData();
  o[centroidGeoid] = [];
  for (let i = 0; i < dates.length; i++) {
    if (!aggregateData[dates[i]]) {
      continue;
    }
    for (let j = 0; j < aggregateData[dates[i]]; i++) {
      const item = aggregateData[dates[i]][j];
      if (item['code'] == code) {
        o[centroidGeoid].push(item['cum_conf']);
        break;
      }
    }
  }
  container = document.createElement('div');
  container.classList.add('chart');
  container.setAttribute('id', 'total');
  container.innerHTML = '';
  // const totalCasesAggregateChart = Graphing.makeCasesGraph(
      // o, true /*average */, container);
  chartsEl.appendChild(container);
}

globalThis['countryInit'] = countryInit;
