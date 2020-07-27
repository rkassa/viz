class CaseMapView extends MapView {

/**
 * @param {DataProvider} dataProvider
 * @param {Nav} nav
 */
constructor(dataProvider, nav) {
  super(dataProvider, new CaseMapDataSource(), nav);
}

getId() {
  return 'casemap';
}

getTitle() {
  return 'Case Map';
}

}
