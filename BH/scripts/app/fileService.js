(function() {

  "use strict";

  // Service to do CRUD operations on photos
  angular
    .module("app")
    .service("fileService", [
      "$http", "$q", "api_file", function($http, $q, api_file) {

        //Get all photos saved on the server  
        function getAll() {

          var deferred = $q.defer();

          $http.get(api_file)
            .success(function(result) {
              deferred.resolve(result);
            })
            .error(function(error) {
              deferred.reject(error);
            });

          return deferred.promise;
        }

        //Get photo from server with given file name        
        function getPhoto(fileName) {

          var deferred = $q.defer();

          $http.get(api_file + fileName)
            .success(function(result) {
              deferred.resolve(result);
            })
            .error(function(error) {
              deferred.reject(error);
            });

          return deferred.promise;
        }

        // Delete photo on the server with given file name      
        function deletePhoto(fileName) {

          var deferred = $q.defer();

          $http.delete(api_file, { params: { fileName: fileName } })
            .success(function(result) {
              deferred.resolve(result);
            }).error(function(error) {
              deferred.reject(error);
            });

          return deferred.promise;
        }

        return {
          getAll: getAll,
          getPhoto: getPhoto,
          deletePhoto: deletePhoto
        };
      }
    ]);


})();