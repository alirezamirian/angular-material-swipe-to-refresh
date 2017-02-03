/*
 * mde-swipe-to-refresh 0.0.3
 * Swipe to refresh (pull to refresh) for Angular Material
 * https://github.com/alirezamirian/angular-material-swipe-to-refresh
*/



(function(angular){
    "use strict";
    angular.module("mde.swipeToRefresh", [])
        .constant("mdeSwipeToRefreshConfig", {
            threshold: 80
        });

})(angular);
(function(angular){
	"use strict";
	mdeSwipeToRefreshDirective.$inject = ["$q", "$timeout", "mdeSwipeToRefreshConfig"];
        angular.module("mde.swipeToRefresh")
		.directive("mdeSwipeToRefresh", mdeSwipeToRefreshDirective);


	var State = {
		None: "None",
		Updating: "Updating",
		Pulling: "Pulling"
	};

	function mdeSwipeToRefreshDirective($q, $timeout, mdeSwipeToRefreshConfig){
		return{
			restrict: "A",
            require: "?^mdeSwipeToRefreshScrollHost",
			transclude: true,
			scope:{
                mdeOnRefresh: "&?",
                mdeOnCancel: "&?",
                mdeScrollHostSelector: "@?",
                mdeThreshold: "=?"
			},
			templateUrl: "swipe-to-refresh/swipe-to-refresh.html",
			link: linkFn
		};

		function linkFn(scope, elem, attrs, mdeSwipeToRefreshScrollHost){
			elem.bind("touchstart", touchStart);
			var scrollHost, startY;
			if(mdeSwipeToRefreshScrollHost){
                scrollHost = mdeSwipeToRefreshScrollHost.getElement();
            }
            else if(scope.mdeScrollHostSelector){
			    var el = elem.parent();
			    while( el[0] != document.body){
                    el = el.parent();
                    if(el[0].matches(scope.mdeScrollHostSelector)){
                        scrollHost = el;
                        break;
                    }
                }
                // if mdeScrollHostSelector doesn't matches anything, fallback to body
                scrollHost = scrollHost || el;
            }
            else{
                // default to body
                scrollHost = angular.element(document.body);
            }
            scope.mdeThreshold = scope.mdeThreshold || mdeSwipeToRefreshConfig.threshold;

            scope.State = State;
            scope.progress = 0;
            scope.state = State.None;


            function touchStart(event){
                if(scope.state != State.None){
                    return;
                }
                startY = event.touches[0].pageY;
                elem.one("touchend", touchEnd);
                elem.bind("touchmove", touchMove);

                if(scrollHost[0].scrollTop == 0){
                    scope.progress = 0;
                    scope.movement = 0;
                    scope.$digest();
                }
            }

            function touchMove(event) {
                if(scrollHost[0].scrollTop > 0){
                    return;
                }
                var movement = event.touches[0].pageY - startY;

                if(movement > 0 && scope.state != State.Pulling){
                    startY = event.touches[0].pageY;
                    movement = 0;
                    scope.state = State.Pulling;
                }

                if(scope.state == State.Pulling){
                    event.preventDefault();
                }

                if(movement > 0){
                    scope.movement = Math.min(calculateMovement(movement, scope.mdeThreshold));
                    scope.progress = Math.min( scope.movement/scope.mdeThreshold, 1);
                    scope.$digest();
				}
				else if(scope.movement > 0){
                    scope.movement = 0;
                    scope.progress = 0;
                    scope.$digest();
                }


            }
            function touchEnd(event){
                elem.unbind("touchmove", touchMove);
                scope.$apply(function(){
                	if(scope.progress == 1){
                        scope.state = State.Updating;
                        scope.movement = scope.mdeThreshold;
                        $q.when((scope.mdeOnRefresh || angular.noop)()).finally(function(){
                            scope.state = State.None;
                            scope.movement = 0;
                            scope.progress = 0;
                        })
                    }
                    else{
                        if(scope.movement > 0){
                            (scope.mdeOnCancel || angular.noop)();
                            scope.movement = 0;
                            scope.progress = 0;
                        }
                        $timeout(function(){
                            scope.state = State.None;
                        },100);
					}
                });
            }
		}
	}
    function calculateMovement(movement, activationThreshold) {
        
        return 2 * activationThreshold * log10((movement + activationThreshold) / activationThreshold);
    }
    function log10(x){
        return Math.log(x)/Math.LN10;
        // we don't use Math.log10 as it's only available in ES6
    }
})(angular);


(function(angular){
    "use strict";
    angular.module('mde.swipeToRefresh')
        .directive('mdeSwipeToRefreshScrollHost', mdeSwipeToRefreshScrollHostDirective);

    function mdeSwipeToRefreshScrollHostDirective(){
        MdeSwipeToRefreshScrollHost.$inject = ["$element"];
        return {
            restrict: "A",
            controller: MdeSwipeToRefreshScrollHost
        };

        function MdeSwipeToRefreshScrollHost($element){
            this.getElement = getElement;

            function getElement(){
                return $element;
            }
        }
    }

})(angular);



// source: https://developer.mozilla.org/en-US/docs/Web/API/Element/matches
if (!Element.prototype.matches) {
    Element.prototype.matches =
        Element.prototype.matchesSelector ||
        Element.prototype.mozMatchesSelector ||
        Element.prototype.msMatchesSelector ||
        Element.prototype.oMatchesSelector ||
        Element.prototype.webkitMatchesSelector ||
        function(s) {
            var matches = (this.document || this.ownerDocument).querySelectorAll(s),
                i = matches.length;
            while (--i >= 0 && matches.item(i) !== this) {}
            return i > -1;
        };
}

(function(module) {
try {
  module = angular.module('mde.swipeToRefresh');
} catch (e) {
  module = angular.module('mde.swipeToRefresh', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('swipe-to-refresh/swipe-to-refresh.html',
    '<div\n' +
    '     class="_indicator-wrap" layout="column" layout-align="center center"\n' +
    '     ng-style="{top: -50 + movement + \'px\'}">\n' +
    '    <span class="md-whiteframe-2dp _indicator" ng-if="state == State.Pulling">\n' +
    '        <md-progress-circular\n' +
    '                md-diameter="20" value="{{progress*80}}"\n' +
    '                ng-style="{transform: \'rotate(\' + movement*1.8 + \'deg)\', opacity: progress == 1 ? 1 : .4}">\n' +
    '        </md-progress-circular>\n' +
    '    </span>\n' +
    '    <!--\n' +
    '    We use ng-show because ng-if will destroy md-progress-circular scope and it will no longer spin while it\'s\n' +
    '    fading out. It event don\'t freezes in it\'s last state.\n' +
    '    -->\n' +
    '    <span class="md-whiteframe-2dp _indicator _updating" ng-show="state == State.Updating">\n' +
    '        <md-progress-circular md-diameter="21" md-mode="indeterminate"></md-progress-circular>\n' +
    '    </span>\n' +
    '</div>\n' +
    '<div ng-transclude></div>\n' +
    '');
}]);
})();
