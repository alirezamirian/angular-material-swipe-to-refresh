# Angular Material Extensions - Swipe to refresh
Implementation of [material design swipe to refresh](https://material.google.com/patterns/swipe-to-refresh.html#swipe-to-refresh-positioning)
for [Angular Material](https://material.angularjs.org).


<p align="center">
  <img src="https://cloud.githubusercontent.com/assets/3150694/20712903/7116dc4c-b65b-11e6-84d7-4a518c6def61.gif" align="center"
alt="swipe to refresh">
</p>

## Dependencies
- Angular Material

## Installation
```bash
bower install mde-swipe-to-refresh --save
```

## Usage
Add script and style:
```html
...
<script src="bower_components/mde-swipe-to-refresh/dist/mde-swipe-to-refresh.min.js"></script>
<link rel="stylesheet" href="bower_components/mde-swipe-to-refresh/dist/mde-swipe-to-refresh.min.css">
...
```
Add module dependency:
```js
angular.module("yourApp", ['mde-swipeToRefresh'])
```
Use it:
```html
<div mde-swipe-to-refresh mde-on-refresh="ctrl.refresh()"></div>
```
By default scrolling element is assumed to be `body`. If it's not the case, you can specify it with one of the following
ways:

- `mde-scroll-host-selector` attribute:
```html
<div mde-swipe-to-refresh mde-scroll-host-selector=".container"></any>
```
It will look up for the first ancestor that matches the selector.

- `mde-swipe-to-refresh-scroll-host` directive:
```html
<div mde-swipe-to-refresh-scroll-host>
    <div mde-swipe-to-refresh></div>
</div>
```
### Options
- `mde-on-refresh`:
Optional expression to evaluate on refresh. If promise is returned, component will stay in spinning state until promise 
is resolved or rejected.
- `mde-on-cancel`:
Optional expression to evaluate on cancel.
- `mde-scroll-host-selector`: String for determining scroll host from ancestors. It will be ignored if 
`mde-swipe-to-refresh-scroll-host` directive is used.
- `mde-threshold`:
Threshold in pixels. Defaults to `mdeSwipeToRefreshConfig.threshold`


## TODO
- [ ] Add docs
- [ ] Improve demo
- [ ] fix bug when scroll host is not correctly set
- [ ] add arrow according to spec
