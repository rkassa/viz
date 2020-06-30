// Filter list of locations
function filterList() {
  let filter = document.getElementById('location-filter').value.toUpperCase();
  let ul = document.getElementById('location-list');
  let list_items = document.getElementById(
      'location-list').getElementsByTagName('li');
  let clearFilter = document.getElementById('clear-filter');
  // Loop through all list items, and hide those who don't match the search
  // query.
  for (let i = 0; i < list_items.length; ++i) {
    let label = list_items[i].getElementsByClassName('label')[0];
    let txtValue = label.textContent || label.innerText;
    // Show/hide the clear filter button.
    clearFilter.style.display = !!filter ? 'flex' : 'none';

    // Show/hide matching list items.
    const show = txtValue.toUpperCase().indexOf(filter) != -1;
    list_items[i].style.display = show ? 'list-item' : 'none';
  }
}

function clearFilter() {
  document.getElementById('location-filter').value = '';
  filterList();
}

function toggleSideBar() {
  let pageWrapper = document.getElementById('page-wrapper');
  const previouslyHidden = pageWrapper.classList.contains('sidebar-hidden');
  document.getElementById('sidebar-tab-icon').textContent =
        previouslyHidden ? '◀' : '▶';
  pageWrapper.classList.toggle('sidebar-hidden');
}

function renderCountryList() {
  let countryList = document.getElementById('location-list');
  const latestAggregateData = dataProvider.getLatestAggregateData();
  if (!latestAggregateData) {
    console.log('No data for rendering country list');
    return;
  }

  // Sort according to decreasing confirmed cases.
  latestAggregateData.sort(function(a, b) {
    return b['cum_conf'] - a['cum_conf'];
  });
  for (let i = 0; i < latestAggregateData.length; ++i) {
    let location = latestAggregateData[i];
    if (!location || !location['code']) {
      // We can't do much with this location.
      continue;
    }
    const code = location['code'];
    const country = countries[code];
    if (!country) {
      continue;
    }
    const name = country.getName();
    const geoid = country.getCentroid().join('|');
    let cumConf = parseInt(location['cum_conf'], 10) || 0;
    let legendGroup = 'default';

    // If the page we are on doesn't have the corresponding UI, we don't need
    // to do anything else.
    if (!!countryList) {
      // No city or province, just the country code.
      locationInfo[geoid] = '||' + code;
      if (cumConf <= 10) {
        legendGroup = '10';
      } else if (cumConf <= 100) {
        legendGroup = '100';
      } else if (cumConf <= 500) {
        legendGroup = '500';
      } else if (cumConf <= 2000) {
        legendGroup = '2000';
      }

      let item = document.createElement('li');
      let button = document.createElement('button');
      button.setAttribute('country', code);
      button.onclick = flyToCountry;
      button.innerHTML = '<span class="label">' + name + '</span>' +
          '<span class="num legend-group-' + legendGroup +
          '"></span>';
      item.appendChild(button);
      countryList.appendChild(item);
    }
  }
  if (!!countryList) {
    updateCountryListCounts();
  }
}

function updateCountryListCounts() {
  const list = document.getElementById('location-list');
  let countSpans = list.getElementsByClassName('num');
  for (let i = 0; i < countSpans.length; i++) {
    let span = countSpans[i];
    const code = span.parentNode.getAttribute('country');
    const country = countries[code];
    let countToShow = dataProvider.getLatestDataPerCountry()[code][0];
    if (document.getElementById('percapita').checked) {
      const population = country.getPopulation();
      if (!!population) {
        countToShow = '' + (100 * countToShow / country.getPopulation()).
              toFixed(3) + '%';
      } else {
        countToShow = '?';
      }
    } else {
      countToShow = countToShow.toLocaleString();
    }
    span.textContent = countToShow;
  }
  sortCountryList();
};

function sortCountryList() {
  const list = document.getElementById('location-list');
  let items = list.children;
  let itemsArray = [];
  for (let i = 0; i < items.length; i++) {
    itemsArray.push(items[i]);
  }
  itemsArray.sort(function(a, b) {
    const str_a = a.getElementsByClassName(
        'num')[0].textContent.replace(/,/g, '');
    const str_b = b.getElementsByClassName(
        'num')[0].textContent.replace(/,/g, '');
    if (str_a == '?') { return 1; }
    if (str_b == '?') { return -1;}
    const count_a = parseFloat(str_a);
    const count_b = parseFloat(str_b);
    return count_a == count_b ? 0 : (count_a < count_b ? 1 : -1);
  });

  for (let i = 0; i < itemsArray.length; i++) {
    list.appendChild(itemsArray[i]);
  }
};

globalThis['clearFilter'] = clearFilter;
globalThis['filterList'] = filterList;
