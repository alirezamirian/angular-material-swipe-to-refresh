/**
 * Created by alireza on 11/28/2016.
 */


(function(){
    "use strict";
    angular.module("mdeSwipeToRefreshDemo", [
        "ngMaterial",
        "mde.swipeToRefresh"
    ])
        .controller("MainController", MainController);

    function MainController($timeout, $mdToast){
        var self = this;
        self.update = update;
        self.cancel = cancel;

        self.items = [];
        for(var i=1; i<=15; i++){
            self.items.push(createItem());
        }


        function cancel(){
            $mdToast.showSimple("Swipe to refresh was canceled");
        }
        function update(){
            return $timeout(1200).then(function(){
                for(var i=1; i<=3; i++){
                    self.items.unshift(createItem());
                }
            });
        }
        function createItem() {
            var palette = ["primary", "accent", "warn"][randInd(0, 3)];
            return {
                color: {
                    background: palette + "-" + (200 + 100 * Math.floor(Math.random() * 5))
                }

            };
        }

        function randInd(min, max){
            return min + Math.floor(Math.random() * max);
        }

    }
})(angular);