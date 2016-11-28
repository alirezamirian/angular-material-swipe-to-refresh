/**
 * Created by alireza on 11/29/2016.
 */

(function(angular){
    "use strict";
    angular.module('mde.swipeToRefresh')
        .directive('mdeSwipeToRefreshScrollHost', mdeSwipeToRefreshScrollHostDirective);

    function mdeSwipeToRefreshScrollHostDirective(){
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