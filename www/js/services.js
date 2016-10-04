
var app = angular.module('app.services',[])

app.service('WC', function(Shop){
    return {
        api: function(){
            var Woocommerce = new WooCommerceAPI.WooCommerceAPI({
                url           : Shop.URL,
                consumerKey   : Shop.ConsumerKey,
                consumerSecret: Shop.ConsumerSecret
            });
            return Woocommerce;
        }
	}
})

app.service('Blog', function($http, $q) {
  var get = function(url){
    return $q(function(resolve, reject){
      $http.get(url).success(function(x){
        resolve(x);
      }).error(function(err){
        reject(err);
      });
    })
  };

  return {
    get: get
  };
})

app.service('Paypal', function($http, $q){
    return {
      getToken: function(url, clientSecretID){
        return $q(function(resolve, reject){
            $http({
              method: 'POST',
              url: url,
              headers: {
                'Content-Type'   : 'application/x-www-form-urlencoded',
                'Accept-Language': 'en_US',
                'Authorization'  : 'Basic '+clientSecretID
               },
              transformRequest: function(obj) {
                  var p, str;
                  str = [];
                  for (p in obj) {
                      str.push(encodeURIComponent(p) + '=' + encodeURIComponent(obj[p]));
                  }
                  return str.join('&');
              },
              data: {grant_type: 'client_credentials'}
            })
            .success(function(x){
              resolve(x);
            })
            .error(function(err){
              reject(err);
            });
        })
      },
      makePayment: function(url, data, token){
        return $q(function(resolve, reject){
          $http({
              method: 'POST',
              url: url,
              headers: {
                'Content-Type'   : 'application/json',
                'Authorization'  : 'Bearer '+token
               },
               data: data
          })
          .success(function(x){
            resolve(x);
          })
          .error(function(err){
            reject(err);
          })
        })
      },
      execute: function(url, payerId, token){
        return $q(function(resolve, reject){
          $http({
              method: 'POST',
              url: url,
              headers: {
                'Content-Type'   : 'application/json',
                'Authorization'  : 'Bearer '+token
               },
               data: {payer_id: payerId}
          })
          .success(function(x){
            resolve(x);
          })
          .error(function(err){
            reject(err);
          })
        })
      }
    }
})

app.factory('AuthService', function($q, $http, WC, Shop) {
  var LOCAL_TOKEN_KEY = Shop.name+"-user";
  var id = '';
  var username = '';
  var email = '';
  var name = '';

  var isAuthenticated = false;
  var role = '';
  var authToken;

  function loadUserCredentials() {
    var user = window.localStorage.getItem(LOCAL_TOKEN_KEY);
    if (user) {
      useCredentials(JSON.parse(user));
    }
  }

  function storeUserCredentials(user) {
        window.localStorage.setItem(LOCAL_TOKEN_KEY, JSON.stringify(user));
        useCredentials(user);
  }

  function useCredentials(user) {
    id       = user.id;
    username = user.username;
    email    = user.email;
    name     = user.firstname+' '+user.lastname;

    isAuthenticated = true;
    authToken = JSON.stringify(user);
    //$http.defaults.headers.common['X-Auth-Token'] = JSON.stringify(user);
  }

  function destroyUserCredentials() {
    authToken = undefined;

    id       = '';
    username = '';
    email    = '';
    name     = '';

    isAuthenticated = false;
    //$http.defaults.headers.common['X-Auth-Token'] = undefined;
    window.localStorage.removeItem(LOCAL_TOKEN_KEY);
  }

  var login =  function(x){
    return $q(function(resolve, reject){
      $http.get(Shop.URL+'/api/user/generate_auth_cookie/?username='+x.user+'&password='+x.pass+'&insecure=cool')
        .success(function(x){
          if(x.status=='ok'){
            storeUserCredentials(x.user);
            resolve(x.user);
          }else
            reject(x.error);
        })
        .error(function(err){
          reject('Error in connection');
        });
    });
  };

  var logout = function(id, os) {
    destroyUserCredentials();
    //$http.get(API+'logout.php?id='+id+'&os='+os, null, function(){});
  };

  var isAuthorized = function(authorizedRoles) {
    if (!angular.isArray(authorizedRoles)) {
      authorizedRoles = [authorizedRoles];
    }
    return (isAuthenticated && authorizedRoles.indexOf(role) !== -1);
  };

  loadUserCredentials();

  return {
    login: login,
    logout: logout,
    isAuthorized: isAuthorized,
    isAuthenticated: function() {return isAuthenticated;},
    id: function() {return id;},
    name: function() {return name;},
    username: function() {return username;},
    email: function() {return email;},
    authToken: function() {return authToken;},
    role: function() {return role;}
  };
});
