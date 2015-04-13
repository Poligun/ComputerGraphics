var galleryApp = angular.module("gallery", []);
var homeworkUrlPrefix = 'homeworks/';

galleryApp.controller('GalleryController', ['$scope', '$http', '$location', function($scope, $http, $location) {
    var url = homeworkUrlPrefix + 'homeworks.json';
    //url = "https://googledrive.com/host/0Bzh04Yk-_c8BfmhvZ3BKbWREYkpMUUVGVmhsODB1WFoyTURreGdkLTJtMXNxYXBudlpnZXM/homeworks.json";
    $scope.homeworks = {};
    $scope.url = "";
    $scope.changeUrl = function(url) {
        if (url.match(/^hw[56].*$/))
            window.location.href = homeworkUrlPrefix + url;//$location.url(url);
        else
            $scope.url = homeworkUrlPrefix + url;
    }
    $scope.isString = function(obj) {
        return typeof(obj) === 'string';
    }
    $http.get(url).success(function(data) {
        $scope.homeworks = data;
    });
}]);
