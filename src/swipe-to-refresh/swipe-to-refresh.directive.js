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
                scope.$apply(function(){
                	scope.progress = 0;
                	scope.movement = 0;
                	$timeout(function (){
                        scope.state = State.Pulling;
                    })
				});
                startY = event.touches[0].pageY;
                elem.one("touchend", touchEnd);
                elem.bind("touchmove", touchMove);
            }

            function touchMove(event) {
                if(scrollHost[0].scrollTop > 0){
                    return;
                }
                var movement = event.touches[0].pageY - startY;

                if(movement > 0){
                    scope.$apply(function(){
                    	scope.movement = Math.min(movement, 15 * Math.log(movement));
                        scope.progress = Math.min( movement/scope.mdeThreshold, 1);
                        // console.log(movement, "=>", scope.movement);

                        if(scope.progress > 0){
                            event.preventDefault();
                        }
                    });
				}


            }
            function touchEnd(event){
                elem.unbind("touchmove", touchMove);
                scope.$apply(function(){
                	if(scope.progress == 1){
                        scope.state = State.Updating;
                        scope.movement = 60;
                        $q.when((scope.mdeOnRefresh || angular.noop)()).finally(function(){
                            scope.state = State.None;
                        })
                    }
                    else{
                        (scope.mdeOnCancel || angular.noop)();
                        scope.movement = 0;
                        $timeout(function(){
                            scope.state = State.None;
                        },100);
					}
                });
            }
		}
	}
})(angular);