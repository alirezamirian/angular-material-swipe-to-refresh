# Angular Material Extensions - Swipe to refresh
Implementation of [material design swipe to refresh](https://material.google.com/patterns/swipe-to-refresh.html#swipe-to-refresh-positioning)
for [Angular Material](https://material.angularjs.org).

## Dependencies
- Angular Material

## Installation
```bash
bower install mde-swipe-to-refresh --save
```

## Usage
```js
angular.module("yourApp", ['mde-swipeToRefresh'])
```
```html
<div mde-swipe-to-refresh mde-on-refresh="ctrl.refresh()"></any>
```
By default scrolling element is assumed to be body. If it's not the case, you can specify it with one of the following
ways:

- `mde-scroll-host-selector` attribute:
```html
<div mde-swipe-to-refresh mde-scroll-host-selector=".container"></any>
```
It will look up the ancestors for an element that matches the selector.

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
