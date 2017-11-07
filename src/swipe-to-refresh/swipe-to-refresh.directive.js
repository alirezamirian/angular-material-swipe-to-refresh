(function(angular){
	"use strict";
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

        function getEvent(event) {
            if (angular.isDefined(event.originalEvent)) {
                return event.originalEvent;
            }
            return event;
        }

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
                startY = getEvent(event).touches[0].pageY;
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
                var movement = getEvent(event).touches[0].pageY - startY;

                if(movement > 0 && scope.state != State.Pulling){
                    startY = getEvent(event).touches[0].pageY;
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
        /*
         These are observations on Nexus 5 for how pulling is calculated based on touch movement.
         It seems there is kind of a logarithmic relation going on (as it also feels so).
         Note that Pixels need to be divided by 3 to become comparable to web (assuming proper viewport tag exists)

         touch movement(x)	=> 	pull (y)
         72, 40
         170, 100
         240, 143
         304, 180 => near threshold
         448, 250
         592, 310
         745, 360
         904, 395
         1254, 430
         * */
        return 2 * activationThreshold * log10((movement + activationThreshold) / activationThreshold);
    }
    function log10(x){
        return Math.log(x)/Math.LN10;
        // we don't use Math.log10 as it's only available in ES6
    }
})(angular);
