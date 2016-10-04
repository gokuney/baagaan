angular.module('app', ['ionic', 'app.controllers', 'app.services', 'ngCordova', 'angularMoment'])

.constant('Shop', {
  version                             : '1.1 beta',
  name                                : 'Baagaan',
  URL                                 : 'http://baagaan.com',
  ConsumerKey                         : 'ck_20719bca84200445c2bcec2a877ce38dc62f8fc6', // Get this from your WooCommerce
  ConsumerSecret                      : 'cs_ba9654fe36f01bf1c8ca548bcbdb756d68a3d528', // Get this from your WooCommerce

  shipping                            : [
                                          {id: 'flat_rate:4', name: 'Local Pickup', cost: 0},
                                          {id: 'flat_rate:3', name: 'Flat Rate', cost: 5},
                                          {id: 'flat_rate:2', name: 'Worldwide Flat Rate', cost: 15}
                                        ],
  payment                             : [
                                          {id: 'cod', name: 'Cash on Delivery', icon: 'fa fa-money', desc: 'Pay with cash upon delivery.'}//,
                                          //{id: 'bacs', name: 'Direct Bank Transfer', icon: 'fa fa-university', desc: 'You can pay using direct bank account'},
                                          //{id: 'paypal', name: 'Paypal', icon: 'fa fa-cc-paypal', desc: 'You can pay via Paypal and Credit Card'}
                                        ],

  GCM_SenderID                        : 'xxxxxxxxxxxx', // Get this from https://console.developers.google.com

  OneSignalAppID                      : 'xxxxxxxxxxxx', // Get this from https://onesignal.com
                                        // Change this paypal sandbox with your own
  payPalSandboxClientSecretBase64     : 'QVpqeUlTYnAxem1PaFowb19pQUczVzJJR2psejJodkVDLThjR29RN2ZYY01GTjlhZmFSdVcwWDFCMVBWU2drU3VUUVdPS3FNOU40TlRrT1A6RUVZTEtFamVNT0tqbHdXZEtYTXI2MEtRcVlZeDg1aC1aOTk0Nk1TdmhLbjEyNmtfUkpWZnpOZEc3V0dpNi14N3RKSlNjOUMxaUc5c2lKb0U=',
  payPalProductionClientSecretBase64  : 'xxxxxxxxxxxx',
  payPalGetTokenURL                   : 'https://api.sandbox.paypal.com/v1/oauth2/token',
  payPalMakePaymentURL                : 'https://api.sandbox.paypal.com/v1/payments/payment',
  payPalReturnURL                     : 'http://localhost/success',
  payPalCancelURL                     : 'http://localhost/cancel'
})

.constant('$ionicLoadingConfig', {
  template: '<ion-spinner icon="dots"></ion-spinner>',
})

.run(function($ionicPlatform, Shop) {
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }

    var notificationOpenedCallback = function(jsonData) {
      console.log('didReceiveRemoteNotificationCallBack: ' + JSON.stringify(jsonData));
    };

    document.addEventListener("deviceready", function(){
      window.plugins.OneSignal.init(Shop.OneSignalAppID,
                                   {googleProjectNumber: Shop.GCM_SenderID},
                                   notificationOpenedCallback);
      // Show an alert box if a notification comes in when the user is in your app.
      window.plugins.OneSignal.enableInAppAlertNotification(true);
    }, false);
  });
})

.config(function($stateProvider, $httpProvider, $urlRouterProvider, $ionicConfigProvider) {

  $ionicConfigProvider.navBar.alignTitle('center');

  $ionicConfigProvider.backButton.text('');
  $ionicConfigProvider.backButton.previousTitleText(false);

  $stateProvider.state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: 'AppCtrl'
  })

  // HOME

  .state('app.dash', {
      url: '/dash',
      views: {
        'menuContent': {
          templateUrl: 'templates/home.html',
          controller: 'HomeCtrl'
        }
      }
    })

  .state('quicksearch', {
    cache: false,
    url: '/quicksearch',
    templateUrl: 'templates/modal-search.html',
    controller: 'QuickSearchCtrl'

  })

  .state('search', {
    url: '/search/:q',
    templateUrl: 'templates/search.html',
    controller: 'SearchCtrl'

  })

  .state('app.faq', {
      url: '/faq',
      views: {
        'menuContent': {
          templateUrl: 'templates/faq.html'
        }
      }
    })

  .state('app.about', {
      url: '/about',
      views: {
        'menuContent': {
          templateUrl: 'templates/about.html'
        }
      }
    })

  .state('app.contact', {
      url: '/contact',
      views: {
        'menuContent': {
          templateUrl: 'templates/contact.html',
          controller: 'ContactCtrl'
        }
      }
    })

  .state('app.login', {
      url: '/login',
      cache: false,
      views: {
        'menuContent': {
          templateUrl: 'templates/login.html',
          controller: 'LoginCtrl'
        }
      }
    })

  .state('app.register', {
      url: '/register',
      cache: false,
      views: {
        'menuContent': {
          templateUrl: 'templates/register.html',
          controller: 'RegisterCtrl'
        }
      }
    })

  .state('app.cart', {
    cache: false,
      url: '/cart',
      views: {
        'menuContent': {
          templateUrl: 'templates/cart.html',
          controller: 'CartCtrl'
        }
      }
    })

  .state('app.orders', {
    cache: false,
      url: '/orders',
      views: {
        'menuContent': {
          templateUrl: 'templates/orders.html',
          controller: 'OrdersCtrl'
        }
      }
    })

  .state('app.order-detail', {
      cache: false,
      url: '/orders/:id',
      views: {
        'menuContent': {
          templateUrl: 'templates/order-detail.html',
          controller: 'OrderDetailCtrl'
        }
      }
    })

  .state('app.checkout', {
      url: '/checkout',
      cache: false,
      views: {
        'menuContent': {
          templateUrl: 'templates/checkout.html',
          controller: 'CheckoutCtrl'
        }
      }
    })

  .state('app.confirm', {
      url: '/confirm',
      cache: false,
      views: {
        'menuContent': {
          templateUrl: 'templates/confirm.html',
          controller: 'ConfirmCtrl'
        }
      }
    })

  .state('app.thanks', {
      url: '/thanks/:id/:total/:payment',
      cache: false,
      views: {
        'menuContent': {
          templateUrl: 'templates/thanks.html',
          controller: 'ThanksCtrl'
        }
      }
    })

  .state('app.category', {
      url: '/category/:id/:title/:slug',
      views: {
        'menuContent': {
          templateUrl: 'templates/category.html',
          controller: 'CategoryCtrl'
        }
      }
    })

  .state('app.product', {
      url: '/product/:category/:id',
      cache: false,
      views: {
        'menuContent': {
          templateUrl: 'templates/product.html',
          controller: 'ProductCtrl'
        }
      }
    })

  .state('app.wish', {
    cache: false,
        url: '/wish',
        views: {
          'menuContent': {
            templateUrl: 'templates/wish.html',
            controller: 'WishCtrl'
          }
        }
      })

  .state('app.blog', {
      url: '/blog',
      views: {
        'menuContent': {
          templateUrl: 'templates/blog.html',
          controller: 'BlogCtrl'
        }
      }
    })

  .state('app.blog-detail', {
      url: '/blog/:id',
      views: {
        'menuContent': {
          templateUrl: 'templates/blog-detail.html',
          controller: 'BlogDetailCtrl'
        }
      }
    })

  $urlRouterProvider.otherwise('/app/dash');
});
