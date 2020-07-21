let viz = null;

function bootstrap() {
  viz = new Viz();
  viz.init();
}

/** @constructor */
let Viz = function() {

  /** @const @private {DataProvider} */
  this.dataProvider_ = new DataProvider(
      'https://raw.githubusercontent.com/ghdsi/covid-19/master/');

  /** @private @const {!Object.<!View>} */
  this.views_ = {};

  /** @const @private {Nav} */
  this.nav_ = new Nav(this);

  /** @private {string} */
  this.currentViewId_ = '';
};

/** @const */
Viz.LIVE_UPDATE_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes

// Globals
let locationInfo = {};
let autoDriveMode = false;
let twoDMode = false;
let initialFlyTo;

let currentIsoDate;
let currentDateIndex = 0;
let currentTouchY = -1;

/** @return {string} */
Viz.prototype.getCurrentViewId = function() {
  return this.currentViewId_;
};

function fetchAboutPage() {
  fetch('https://raw.githubusercontent.com/ghdsi/covid-19/master/about.html')
    .then(function(response) { return response.text(); })
    .then(function(html) { handleShowModal(html); });
}

function handleShowModal(html) {
  let modal = document.getElementById('modal');
  let modalWrapper = document.getElementById('modal-wrapper');
  // Switch elements to have 'display' value (block, flex) but keep hidden via
  // opacity
  modalWrapper.classList.add('is-block');
  modal.classList.add('is-flex');
  setTimeout(function () {
    // for transition
    modalWrapper.classList.add('is-visible');
    modal.classList.add('is-visible');
  }, 40);
  modal.innerHTML = html;
  // Attach an event to the close button once this is finished rendering.
  setTimeout(function() {
    document.getElementById('modal-cancel').onclick = handleHideModal;
  }, 0);
}

function handleHideModal() {
  let modal = document.getElementById('modal');
  let modalWrapper = document.getElementById('modal-wrapper');
  modalWrapper.classList.remove('is-visible');
  modal.classList.remove('is-visible');
  setTimeout(function () {
    // for transition
    modalWrapper.classList.remove('is-block');
    modal.classList.add('is-flex');
  }, 400);
}

// function showDataAtDate(iso_date) {
  // map.showDataAtDate(iso_date);
// }

// Viz.prototype.onAllDataFetched = function() {
  // if (autoDriveMode) {
    // this.timeAnimation_.toggleMapAnimation(this.onMapAnimationEnded.bind(this));
  // }
// }

Viz.prototype.init = function() {

  this.registerView(new CaseMapView(this.dataProvider_, this.nav_));
  this.registerView(new HistoricalMapView(this.dataProvider_, this.nav_));
  this.registerView(new RankView(this.dataProvider_, this.nav_));
  this.registerView(new SyncView(this.dataProvider_));
  this.registerView(new CompletenessView(this.dataProvider_));

  this.nav_.setupTopBar();

  let self = this;
  window.onhashchange = function(h) {
    console.log('Hash change ' + h.newURL);
  }

  // document.getElementById('credit').onclick = fetchAboutPage;
  window.setTimeout(this.updateData.bind(this), Viz.LIVE_UPDATE_INTERVAL_MS);
}

/** @param {!View} view */
Viz.prototype.registerView = function(view) {
  this.views_[view.getId()] = view;
}

Viz.prototype.updateData = function() {
  console.log('Updating data...');
  this.dataProvider_.fetchLatestCounts(true /* forceRefresh */).then(function() {
    console.log('Updated latest counts.');
  });
  this.dataProvider_.fetchDataIndex().then(function() {
    console.log('Updated data index.');
  });

  // Update the data again after another time interval.
  window.setTimeout(this.updateData.bind(this), Viz.LIVE_UPDATE_INTERVAL_MS);
};

Viz.prototype.loadView = function(viewId) {
  if (this.currentViewId_ == viewId) {
    // Nothing to do.
    console.log('Same view requested again, aborting.');
    return;
  }
  if (this.views_.hasOwnProperty(viewId)) {
    if (!!this.currentViewId_) {
      this.views_[this.currentViewId_].unload();
    }
    this.currentViewId_ = viewId;
    this.views_[viewId].prepareAndRender();
  }
}

Viz.prototype.onConfigChanged = function(config) {
  let views = Object.values(this.views_);
  for (let i = 0; i < views.length; i++) {
    views[i].onConfigChanged(config);
  }
}

// Exports
if (typeof(globalThis) === 'undefined' && typeof(global) !== "undefined") {
    globalThis = global;
}
globalThis['bootstrap'] = bootstrap;
