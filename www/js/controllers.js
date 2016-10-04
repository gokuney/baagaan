var app = angular.module('app.controllers', []);

app.filter('trusted', function($sce){
    return function(url){
        return $sce.trustAsResourceUrl(url);
    }
})

app.directive('focusMe', function($timeout) {
  return {
    link: function(scope, element, attrs) {
      $timeout(function() {
        element[0].focus();
      }, 150);
    }
  };
});

app.controller('AppCtrl', function($scope, $state, $ionicPlatform, $cordovaDialogs, $timeout, $ionicLoading, $ionicSideMenuDelegate, $state, WC, Shop, AuthService){
	$scope.appname    = Shop.name;
  $scope.appversion = Shop.version;

	var Woocommerce = WC.api();

	/* GET APP INFO */
    $ionicLoading.show();
	Woocommerce.get('', function(err, data, res){
        //console.log(JSON.parse(res).store);
        $scope.store = JSON.parse(res).store;
        $scope.currency = $scope.store.meta.currency+' ';
    });

	/* END APP INFO */

	/* GET CATEGORY & SUB CATEGORY */
	var tmp = [];
	Woocommerce.get('products/categories', function(err, data, res){
		var p = JSON.parse(res).product_categories;
        //console.log(p);
		for(var i in p){
		    if(p[i].parent==0){
		        var items = [];
		        for(var y in p){
		            if(p[y].parent==p[i].id)
		                items.push({id: p[y].id, name: p[y].name, slug: p[y].slug, image: p[y].image, count: p[y].count});
		        }
		        tmp.push({id: p[i].id, name: p[i].name, slug: p[i].slug, image: p[i].image, items: items});
		    }
		}
        $ionicLoading.hide();
	})

	$scope.categories = tmp;

	/* END GET CATEGORY & SUB CATEGORY */

	$scope.updateCart = function(){
        var cart = window.localStorage.getItem(Shop.name+"-cart") ? JSON.parse(window.localStorage.getItem(Shop.name+"-cart")) :'';
        if(cart.length>0){
            $scope.totalCartItem = 0;
            for(var i in cart)
                $scope.totalCartItem += cart[i].qty;
        }else  $scope.totalCartItem = 0;
    };

	$scope.user = {
		id: AuthService.id(),
		username: AuthService.username(),
		email: AuthService.email(),
		name: AuthService.name(),
		isLogin: AuthService.isAuthenticated()
	};

    $scope.$on('$stateChangeSuccess', function() {
      $scope.updateCart();

      $scope.user = {
        id: AuthService.id(),
        username: AuthService.username(),
        email: AuthService.email(),
        name: AuthService.name(),
        isLogin: AuthService.isAuthenticated()
      };
    });

    $scope.showSuccess = function(x, time){
        var time = time ? time : 2000;
        $ionicLoading.show({
            template: '<div class="info"><i class="icon ok ion-ios-checkmark"></i></div><div>'+x+'</div>'
        });
        $timeout(function() {
            $ionicLoading.hide();
        }, time);
    };

    $scope.showError = function(x, time){
        var time = time ? time : 4000;
        $ionicLoading.show({
            template: '<div class="info"><i class="icon err ion-sad-outline"></i></div><div>'+x+'</div>'
        });
        $timeout(function() {
            $ionicLoading.hide();
        }, time);
    };

    $scope.doLogout = function(){
      AuthService.logout();
      $scope.user.isLogin = false;
      $ionicSideMenuDelegate.toggleLeft();
      $state.go("app.dash", {}, {reload: true});
    };

    $ionicPlatform.registerBackButtonAction(function(e) {
      e.preventDefault();
      if($state.is('app.dash') || $state.is('app.orders') || $state.is('app.login') || $state.is('app.about') || $state.is('app.faq') || $state.is('app.contact')) {
        e.stopPropagation();
        $cordovaDialogs.confirm('Are you sure want to exit?', 'Exit Ionstore', ['Yes','No'])
          .then(function(buttonIndex) {
            // no button = 0, 'OK' = 1, 'Cancel' = 2
            var btnIndex = buttonIndex;
            if(btnIndex==1)
              ionic.Platform.exitApp();
            else
              return false;
          });
      }else
          navigator.app.backHistory();
    },100);

	$scope.toggleGroup = function(group) {
		if ($scope.isGroupShown(group)) {
		  $scope.shownGroup = null;
		} else {
		  $scope.shownGroup = group;
		}
	};

	$scope.isGroupShown = function(group) {
		return $scope.shownGroup === group;
	};

	ionic.material.ink.displayEffect();
})

app.controller('HomeCtrl', function($scope, $timeout, $ionicLoading, $ionicScrollDelegate, WC){
	$scope.$on('$ionicView.beforeEnter', function (event, viewData) {
        viewData.enableBack = false;
    });

    $scope.more = false;
	var page = 1;

	$ionicLoading.show();

    $scope.doRefresh = function(){
        page = 1;
    	WC.api().get('products?page='+page+'&fields=id,title,price,regular_price,on_sale,in_stock,featured_src', function(err, data, res){
    		if(err) console.log(err);
    		$scope.products = JSON.parse(res).products;
    		if(JSON.parse(res).products.length >= 10) $scope.more = true;
    		$ionicLoading.hide();
            $ionicScrollDelegate.resize();
            $scope.$broadcast('scroll.refreshComplete');
    	})
    }

    $scope.doRefresh();

	$scope.loadMore = function(){
		//$ionicLoading.show();
		page++;
		WC.api().get('products?page='+page+'&fields=id,title,price,regular_price,on_sale,in_stock,featured_src', function(err, data, res){
      $timeout(function(){
        if(JSON.parse(res).products.length < 10)
          $scope.more = false;
  			$scope.products = $scope.products.concat(JSON.parse(res).products);
  			$scope.$broadcast('scroll.infiniteScrollComplete');
      });
			//$ionicLoading.hide();
		})
	}

  ionic.material.ink.displayEffect();
})

app.controller('SearchCtrl', function($scope, $ionicLoading, WC){
})


app.controller('QuickSearchCtrl', function($scope, $ionicLoading, $ionicScrollDelegate, WC){

    $scope.pro = '';

    $scope.onSwipe = function() {
        cordova.plugins.Keyboard.close();
    };

    //cordova.plugins.Keyboard.show();

    if (window.cordova && window.cordova.plugins.Keyboard)
        cordova.plugins.Keyboard.show();

    $scope.clearSearch = function(){
        $scope.pro = '';
        $ionicScrollDelegate.scrollTop();
        if (window.cordova && window.cordova.plugins.Keyboard)
            cordova.plugins.Keyboard.close();
    };

    $scope.search = function(){
        if($scope.search.q){
            $scope.quickSearch();
        }else
            return false;
    };

    WC.api().get('products?fields=id,title', function(err, data, res){
        $scope.dataSearch = JSON.parse(res).products;
    });

    ionic.material.ink.displayEffect();
})

app.controller('WishCtrl', function($scope, $cordovaToast, Shop){
  $scope.wish = window.localStorage.getItem(Shop.name+'-wish') ? JSON.parse(window.localStorage.getItem(Shop.name+'-wish')) : [];

  $scope.data = {
    showDelete: false
  }

  console.log($scope.wish);

  $scope.removeWish = function(i, x){
    $scope.wish.splice(i, 1);
    window.localStorage.setItem(Shop.name+"-wish", JSON.stringify($scope.wish));
    $cordovaToast.showLongBottom("Product has been removed from Wishlist").then(function(){}, function(){});
  }

  ionic.material.ink.displayEffect();
})

app.controller('BlogCtrl', function($scope, $ionicScrollDelegate, $ionicLoading, Blog, Shop){
    $scope.more = false;
    var page = 1;
    $ionicLoading.show();
    $scope.doRefresh = function(){
        Blog.get(Shop.URL+'/api/get_recent_posts/?page=1')
        .then(function(x){
            if(x.status!='ok'){
                $scope.showError('There was an error. Please try again.');
                return false;
            }
            $scope.blog = x.posts;
            if(x.pages>1) $scope.more = true;
            $ionicScrollDelegate.resize();
            $scope.$broadcast('scroll.refreshComplete');
            $ionicLoading.hide();
        }, function(err){
            console.log(err);
        });
    };

    $scope.doRefresh();

    $scope.loadMore = function(){
        page++;
        Blog.get(Shop.URL+'/api/get_recent_posts/?page='+page)
        .then(function(x){
            if(x.count==0) $scope.more = false;
            $scope.blog.concat(x.posts);
            $scope.$broadcast('scroll.infiniteScrollComplete');
        }, function(err){
            $scope.showError('There was an error. Please try again.');
        });
    };

    ionic.material.ink.displayEffect();
})

app.controller('BlogDetailCtrl', function($scope, $stateParams, $ionicLoading, $state, Shop, Blog){
    $ionicLoading.show();
    Blog.get(Shop.URL+'/api/get_post?id='+$stateParams.id)
        .then(function(x){
            $scope.data = x.post;
            $ionicLoading.hide();
        }, function(err){
            $scope.showError('There was an error. Please try again.');
        });

    ionic.material.ink.displayEffect();
})

app.controller('ProductCtrl', function($scope, $state, $timeout, $filter, $cordovaToast, $cordovaSocialSharing, $window, $ionicModal, $ionicLoading, $ionicSlideBoxDelegate, $ionicScrollDelegate, $stateParams, WC, Shop){
  var wish = window.localStorage.getItem(Shop.name+'-wish');

  $scope.$on('$ionicView.beforeEnter', function (event, viewData) {
        viewData.enableBack = true;
    });

  var Woocommerce = WC.api();
	var id = $stateParams.id;

	$ionicLoading.show();

	Woocommerce.get('products/'+id+'?fields=id,title,permalink,featured_src,attributes,description,images,on_sale,price,regular_price,in_stock,related_ids,sale_price,short_description,total_sales,variations', function(err, data, res){
		if(err) console.log(err);
		$timeout(function(){
      $scope.product = JSON.parse(res).product;
      $ionicLoading.hide();
  		$ionicSlideBoxDelegate.update();
    });
	});

	$scope.setVariation = function(x){
		$scope.product.id = x.id;
        $scope.product.price = x.price;
        $scope.product.regular_price = x.regular_price;
        $scope.product.on_sale = x.on_sale;
        if(x.image)
            $scope.product.images = x.image;
        $scope.product.name = x.attributes[0].name;
        $scope.product.option = x.attributes[0].option;
        $scope.product.in_stock = x.in_stock;

        $ionicSlideBoxDelegate.update();
        $ionicScrollDelegate.scrollTop();
    };

    $scope.addItem = function(x, qty){
        var cart = window.localStorage.getItem(Shop.name+"-cart");
        if(cart){
            var exist = false;
            cart = JSON.parse(cart);
            for(i in cart){
                if(cart[i].id == x.id){
                    exist = true;
                    cart[i].qty = cart[i].qty+qty;
                    window.localStorage.setItem(Shop.name+"-cart", JSON.stringify(cart));
                    $scope.showSuccess('Product added successfully');
                    $scope.updateCart();
                    break;
                }
            }
            if(!exist){
                if(x.option)
                    cart.push({id: x.id,title: x.title, price: x.price, img: x.featured_src, qty: 1, variations: {name: x.name, option: x.option}});
                else
                   cart.push({id: x.id,title: x.title, price: x.price, img: x.featured_src, qty: 1});
                window.localStorage.setItem(Shop.name+"-cart", JSON.stringify(cart));
                $scope.showSuccess('Product added successfully');
            }
        }else{
            var tmp = [];
            if(x.option)
                tmp.push({id: x.id,title: x.title, price: x.price, img: x.featured_src, qty: 1, variations: {name: x.name, option: x.option}});
            else
                tmp.push({id: x.id,title: x.title, price: x.price, img: x.featured_src, qty: 1});
            window.localStorage.setItem(Shop.name+"-cart", JSON.stringify(tmp));
            $scope.showSuccess('Product added successfully');
        }

        $scope.updateCart();
    };

    $scope.zoomMin = 1;

    $scope.screenHeight =  $window.innerHeight;

    $scope.showImages = function(index) {
        $scope.activeSlide = index;
        $scope.showModal('templates/product-zoom.html');
    };

    $scope.showModal = function(templateUrl) {
        $ionicModal.fromTemplateUrl(templateUrl, {
          scope: $scope
        }).then(function(modal) {
          $scope.modal = modal;
          $scope.modal.show();
        });
    }

    $scope.closeModal = function() {
        $scope.modal.hide();
        $scope.modal.remove();
    };

    if(wish){
      tmp = JSON.parse(wish);
      for(var i in tmp){
        if(tmp[i].id == id){
          $scope.isWishlist = true;
          break;
        }
      }
    }

    $scope.toWishlist = function(x){
        var wish = window.localStorage.getItem(Shop.name+"-wish");
        if(wish){
            var tmp = JSON.parse(wish);
            if($scope.isWishlist){
                for(var i in tmp){
                    if(tmp[i].id == x.id){
                        tmp.splice(i, 1);
                        break;
                    }
                }
                $scope.isWishlist = false;
                $cordovaToast.showLongBottom('Product has been removed from Wishlist').then(function(success) {}, function (error) {});
            }else{
                tmp.push({id: x.id,title: x.title, price: x.price, img: x.featured_src});
                $scope.isWishlist = true;
                $cordovaToast.showLongBottom('Product has been added successfully into Wishlist').then(function(success) {}, function (error) {});
            }
        }else{
            var tmp = [];
            tmp.push({id: x.id,title: x.title, price: x.price, img: x.featured_src});
            $scope.isWishlist = true;
            $cordovaToast.showLongBottom('Product has been added successfully into Wishlist').then(function(success) {}, function (error) {});
        }
        window.localStorage.setItem(Shop.name+"-wish", JSON.stringify(tmp));
        $scope.updateCart();
    };

    $scope.share = function(x){
        $ionicLoading.show();
        $cordovaSocialSharing
            .share("Sell "+x.title+" for only "+$filter('currency')(x.price, $scope.currency+' ', 0)+", for more details check this out.", x.title, x.featured_src, x.permalink)
            .then(function(result) {
                $ionicLoading.hide();
            }, function(err) {
                $scope.showSuccess(err);
            });
    };
})

app.controller('CategoryCtrl', function($scope, $timeout, $ionicLoading, $ionicScrollDelegate, $stateParams, WC){
	$scope.more = false;
	var page = 1;
	var category = $stateParams.slug.replace("-", " ");
	$scope.title = $stateParams.title;

	$ionicLoading.show();
    $scope.doRefresh = function(){
        page = 1;
    	WC.api().get('products?filter[category]='+category+'&page='+page+'&fields=id,title,price,regular_price,on_sale,in_stock,featured_src', function(err, data, res){
    		if(err) console.log(err);
    		//console.log(JSON.parse(res));
    		$scope.products = JSON.parse(res).products;
    		if(JSON.parse(res).products.length >= 10) $scope.more = true;
    		$ionicLoading.hide();
            $ionicScrollDelegate.resize();
            $scope.$broadcast('scroll.refreshComplete');
    	})
    }

    $scope.doRefresh();

	$scope.loadMore = function(){
		//$ionicLoading.show();
		page++;
		WC.api().get('products?filter[category]='+category+'&page='+page+'&fields=id,title,price,regular_price,on_sale,in_stock,featured_src', function(err, data, res){
			//console.log(JSON.parse(res));
      $timeout(function(){
      	if(JSON.parse(res).products.length < 10)
            $scope.more = false;
  			$scope.products = $scope.products.concat(JSON.parse(res).products);
  			$scope.$broadcast('scroll.infiniteScrollComplete');
      });
			//$ionicLoading.hide();
		})
	}
})

app.controller('CartCtrl', function($scope, $ionicModal, $ionicLoading, $state, AuthService, Shop){
	$scope.cart = JSON.parse(window.localStorage.getItem(Shop.name+"-cart"));

	$scope.data = {
        showDelete: false
    };

    $scope.addItem = function(x, qty){
        for(i in $scope.cart){
            if($scope.cart[i].id == x.id){
                exist = true;
                $scope.cart[i].qty = $scope.cart[i].qty+qty;

                if($scope.cart[i].qty==0){
                    $scope.cart.splice(i, 1);
                }
                break;
            }
        }
        window.localStorage.setItem(Shop.name+"-cart", JSON.stringify($scope.cart));
        $scope.updateCart();
    };

    $scope.getCartItems = function(){
    	var tmp=0;
        for(i in $scope.cart)
            tmp+=$scope.cart[i].qty;
        return tmp;
    }

    $scope.getCartTotal=function(){
        var tmp=0;
        for(i in $scope.cart)
            tmp+=$scope.cart[i].qty*$scope.cart[i].price;
        return tmp;
    };

    $scope.removeCart = function(i, x){
        $scope.cart.splice(i, 1);
        window.localStorage.setItem(Shop.name+"-cart", JSON.stringify($scope.cart));
        $scope.updateCart();
    }

    $scope.goCheckout = function(){
        if($scope.user.isLogin)
            $state.go("app.checkout");
        else{
            $ionicModal.fromTemplateUrl("templates/modal-login.html", {
                scope: $scope,
                animation: 'slide-in-up'
            }).then(function(modal) {
                $scope.modal = modal;
                $scope.modal.show();
            });
        }
    };

    $scope.closeModal = function(){
        $scope.modal.hide();
    };

    $scope.guestCheckout = function(){
        $scope.closeModal();
        $state.go("app.checkout");
    };

    $scope.u = {
        user: '',
        pass: ''
    };

    $scope.doLogin = function(){
        $ionicLoading.show();
        AuthService.login($scope.u).then(function(x){
            $ionicLoading.hide();
            $scope.closeModal();
            $state.go("app.checkout");
        }, function(err){
            $ionicLoading.hide();
            $scope.message = err;
        });
    };

    ionic.material.ink.displayEffect();
})

app.controller('CheckoutCtrl', function($scope, $state, $ionicModal, $http, $ionicLoading, WC, Shop){
    //console.log($scope.user.shipping);

    $scope.ship = {
        first_name: '',
        last_name: '',
        email: '',
        country: '',
        address_1: '',
        address_2: '',
        city: '',
        state: '',
        postcode: ''
    };

    $scope.billing = {
        phone: '',
        email: ''
    };

    $scope.tmp = {
        note: '',
        country: ''
    };

    if($scope.user.isLogin){
        $ionicLoading.show();
        WC.api().get('customers/'+$scope.user.id, function(err, data, res){
            if(err) console.log(err);
            var user = JSON.parse(res).customer;
            $scope.billing = {
                first_name  : (user.billing_address.first_name ? user.billing_address.first_name : ''),
                last_name   : (user.billing_address.last_name ? user.billing_address.last_name : ''),
                email       : $scope.user.email,
                phone       : (user.billing_address.phone ? user.billing_address.phone : ''),
                country     : (user.billing_address.country ? user.billing_address.country : ''),
                address_1   : (user.billing_address.address_1 ? user.billing_address.address_1 : ''),
                address_2   : (user.billing_address.address_2 ? user.billing_address.address_2 : ''),
                city        : (user.billing_address.city ? user.billing_address.city : ''),
                state       : (user.billing_address.state ? user.billing_address.state : ''),
                postcode    : (user.billing_address.postcode ? user.billing_address.postcode : '')
            };

            $scope.ship = {
                first_name  : (user.shipping_address.first_name ? user.shipping_address.first_name : ''),
                last_name   : (user.shipping_address.last_name ? user.shipping_address.last_name : ''),
                country     : (user.shipping_address.country ? user.shipping_address.country : ''),
                address_1   : (user.shipping_address.address_1 ? user.shipping_address.address_1 : ''),
                address_2   : (user.shipping_address.address_2 ? user.shipping_address.address_2 : ''),
                city        : (user.shipping_address.city ? user.shipping_address.city : ''),
                state       : (user.shipping_address.state ? user.shipping_address.state : ''),
                postcode    : (user.shipping_address.postcode ? user.shipping_address.postcode : '')
            };

            if($scope.ship.country){
                $scope.tmp.country = 'loading country ...'
                $http.get("https://api.theprintful.com/countries").success(function(x){
                    var tmp = x.result;
                    for(var i in tmp){
                        if(tmp[i].code==$scope.ship.country)
                            $scope.tmp.country = tmp[i].name
                    }
                    $ionicLoading.hide();
                }).error(function(err){ $scope.tmp.country = ''; });
            }

            $ionicLoading.hide();
        })
    }

    $scope.shipping_lines = {
        method_id: '',
        method_title: '',
        total: 0
    };

    $scope.payment_details = {
        method_id: '',
        method_title: '',
        paid: false
    };

    $scope.showCountry = function(){
        $ionicLoading.show();
        $http.get("https://api.theprintful.com/countries").success(function(x){
            $scope.countries = x.result;
            $ionicLoading.hide();
        }).error(function(err){
            $ionicLoading.hide();
            $scope.showError("Error in connection. Please try again.");
        });

        $ionicModal.fromTemplateUrl("templates/modal-country.html", {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal) {
            $scope.modal = modal;
            $scope.modal.show();
        });
    };

    $scope.shipping = Shop.shipping;
    $scope.payment  = Shop.payment;

    $scope.setCountry = function(x){
        $scope.ship.country = x.code;
        $scope.tmp.country = x.name;
        $scope.closeModal();
    }

    $scope.setShip = function(x){
        $scope.shipping_lines = [{
            method_id: x.id,
            method_title: x.name,
            total: x.cost
        }];
    }

    $scope.setPayment = function(x){
        $scope.payment_details = {
            method_id: x.id,
            method_title: x.name,
            paid: false
        };
    }

    $scope.closeModal = function(){
        $scope.modal.hide();
    }

    $scope.doConfirm = function(){
        var order = {
            payment_details  : $scope.payment_details,
            shipping_address : $scope.ship,
            billing_address  : $scope.billing,
            shipping_lines   : $scope.shipping_lines,
            customer_id      : $scope.user.id,
            note             : $scope.tmp.note
        }
        window.localStorage.setItem(Shop.name+"-order", JSON.stringify(order));
        $state.go("app.confirm");
    }

})

app.controller('OrdersCtrl', function($scope, $ionicLoading, $state, WC){
    $scope.$on('$ionicView.beforeEnter', function (event, viewData) {
        viewData.enableBack = false;
    });

    if(!$scope.user.isLogin)
        $state.go("app.login");

    $scope.doRefresh = function(){
        page = 1;
        $ionicLoading.show();
        WC.api().get('customers/'+$scope.user.id+'/orders?page='+page+'&fields=id,created_at,total,line_items,status', function(err, data, res){
            if(err){
                $ionicLoading.hide();
                $scope.showError("Error in connection. Please try again.");
                return false;
            }
            $scope.orders = JSON.parse(res).orders;
            $ionicLoading.hide();
        })
    }
    $scope.doRefresh();
})

app.controller('OrderDetailCtrl', function($scope, $stateParams, $ionicLoading, $state, WC){
    $scope.id = $stateParams.id;
    $ionicLoading.show();
    WC.api().get('orders/'+$stateParams.id, function(err, data, res){
        if(err){
            $scope.showError("Error in connection. Please try again.");
            $ionicLoading.hide();
            return false;
        }
        $scope.order = JSON.parse(res).order;
        $ionicLoading.hide();
    })
})

app.controller('ConfirmCtrl', function($scope, $state, $ionicLoading, $timeout, $http, WC, Shop, Paypal){
    var order = JSON.parse(window.localStorage.getItem(Shop.name+"-order"));
    var cart = JSON.parse(window.localStorage.getItem(Shop.name+"-cart"));
    var line_items = [], subtotal = 0;

    $scope.shipmethod    = order.shipping_lines[0].method_title;
    $scope.paymentmethod = order.payment_details.method_title;

    for(var i in cart){
        subtotal += cart[i].price * cart[i].qty;
        if(cart[i].variations){
            line_items.push({
                product_id: cart[i].id,
                quantity: cart[i].qty,
                variations: {
                    //name: cart[i].variations.name,
                    //option: cart[i].variations.option
                    [cart[i].variations.name]: cart[i].variations.option
                }
            });
        }
        else line_items.push({product_id: cart[i].id, quantity: cart[i].qty});
    }

    $scope.subtotal = subtotal;
    $scope.shipcost = order.shipping_lines[0].total;
    $scope.total    = $scope.subtotal + $scope.shipcost;

    order.line_items = line_items;

    $scope.createOrder = function(){
        $ionicLoading.show();
        var data = {order: order};
        WC.api().post('orders', data, function(err, data, res){
            var q = JSON.parse(res);

            if(err){
                $ionicLoading.hide();
                $scope.showError("Error in connection. Try again.");
                return false;
                $state.go("app.checkout");
            }

            var order = JSON.parse(res).order;

            window.localStorage.removeItem(Shop.name+"-cart");
            window.localStorage.removeItem(Shop.name+"-order");

            if(order.payment_details.method_id=='paypal'){
                var clientSecretID = Shop.payPalSandboxClientSecretBase64;
                var getTokenURL    = Shop.payPalGetTokenURL;

                Paypal.getToken(getTokenURL, clientSecretID).then(function(x){
                    var data = {
                          intent: "sale",
                          redirect_urls: {
                            return_url: Shop.payPalReturnURL,
                            cancel_url: Shop.payPalCancelURL
                          },
                          payer:{
                            payment_method: "paypal"
                          },
                          transactions:[
                            {
                              amount:{
                                total: order.total,
                                currency: $scope.currency
                              }
                            }
                          ]
                        };

                    var makePaymentURL = Shop.payPalMakePaymentURL;
                    Paypal.makePayment(makePaymentURL, data, x.access_token).then(function(y){
                        var inAppBrowserRef  = undefined;
                        if(y.state=="created"){
                            var payerid;
                            inAppBrowserRef = cordova.InAppBrowser.open(y.links[1].href, "_blank", "location=no&clearcache=yes&zoom=no&toolbar=no,status=no,titlebar=no");
                            with (inAppBrowserRef) {
                                addEventListener('loadstart', function(event) {
                                  if(event.url.search('PayerID') != -1){
                                      var data = event.url.split("&");
                                      payerid = data[2].substring(8);
                                      inAppBrowserRef.close();
                                      Paypal.execute(y.links[2].href, payerid, x.access_token).then(function(z){
                                          console.log(z);
                                          // update order status to be "completed"
                                          WC.api().put('orders/'+order.id, {order: {status: 'completed'}}, function(err, data, res){
                                              $ionicLoading.hide();
                                              $state.go('app.thanks', {id: order.id, total: order.total, payment: 'paypal'});
                                          });
                                      }, function(err){
                                          payerid = '';
                                          inAppBrowserRef.close();
                                          $scope.showError("There was an error. Please try again.");
                                      });
                                  }
                                });
                                addEventListener('exit', exitBrowser);
                            }

                            function exitBrowser(event){
                              if(!payerid){
                                WC.api().put('orders/'+order.id, {order: {status: 'cancelled'}}, function(err, data, res){
                                  console.log(res);
                                });
                                $scope.showError("Your order #"+order.id+" has been cancelled.", 3000);
                                $state.go("app.dash");
                              }
                            }

                        }else{
                            // PayPal Error
                            WC.api().put('orders/'+order.id, {order: {status: 'cancelled'}}, function(err, data, res){
                              $scope.showError("Your order #"+order.id+" has been cancelled.");
                            });
                        }
                    }, function(err){
                        $scope.showError("There was an error. Please try again.");
                    });

                }, function(err){
                    $scope.showError("There was an error. Please try again.");
                })
            }else{
                $ionicLoading.hide();
                $state.go('app.thanks', {id: order.id, total: order.total, payment: order.payment_details.method_id});
            }
        })
    }

})

app.controller('ThanksCtrl', function($scope, $stateParams){
    $scope.$on('$ionicView.beforeEnter', function (event, viewData) {
        viewData.enableBack = false;
    });

    $scope.id      = $stateParams.id;
    $scope.total   = $stateParams.total;
    $scope.payment = $stateParams.payment;
})

app.controller('LoginCtrl', function($scope, $ionicLoading, $state, AuthService){
    $scope.u = {
        user: '',
        pass: ''
    };

    $scope.doLogin = function(){
        $ionicLoading.show();
        AuthService.login($scope.u).then(function(x){
            $ionicLoading.hide();
            $state.go("app.dash");
        }, function(err){
            $ionicLoading.hide();
            $scope.message = err;
        });
    };

    ionic.material.ink.displayEffect();
})

app.controller('ContactCtrl', function($scope, $cordovaSocialSharing, Shop){
    $scope.email = function(){
        var message = "Dear "+Shop.name+", Thanks for great apps. It is very easy to use. Simple and elegant. <br><br>-----------<br>Appname: "+Shop.name+" "+Shop.version+"<br>Platform: "+ionic.Platform.platform()+" v"+ionic.Platform.version();
        var subject = 'Support';
        var to = 'ionicpremium@gmail.com'; // replace this with your own email
        var cc = 'info@ionicpremium.com';  // replace this with your own email
        $cordovaSocialSharing
            .shareViaEmail(message, subject, to, cc, null, null)
            .then(function(result) {
              // Success!
            }, function(err) {
              // An error occurred. Show a message to the user
            });
    };

    ionic.material.ink.displayEffect();
})

app.controller('RegisterCtrl', function($scope, $ionicLoading, $http, $state, AuthService, Shop){
    $scope.u = {
        username: '',
        pass: '',
        email: '',
    };

    $scope.doRegister = function(){
        $ionicLoading.show();
        $http.get(Shop.URL+"/api/get_nonce/?controller=user&method=register")
            .success(function(x){
                if(x.nonce){
                    //console.log($scope.u);
                    $http.get(Shop.URL+"/api/user/register/?username="+$scope.u.username+"&nonce="+x.nonce+"&email="+$scope.u.email+"&first_name="+$scope.u.first_name+"&last_name="+$scope.u.last_name+"&user_pass="+$scope.u.pass+"&insecure=cool&display_name="+$scope.u.first_name+" "+$scope.u.last_name)
                        .success(function(y){
                            if(y.status=='ok'){
                                var login = {
                                    user: $scope.u.username,
                                    pass: $scope.u.pass,
                                }
                                AuthService.login(login)
                                    .then(function(z){
                                        $ionicLoading.hide();
                                        $state.go("app.dash", {}, {reload: true});
                                    }, function(err){
                                        $ionicLoading.hide();
                                        $scope.message = err;
                                    });
                            }else{
                                $ionicLoading.hide();
                                $scope.message = y.error;
                            }
                        })
                        .error(function(err){
                            $ionicLoading.hide();
                            $scope.message = err.error;
                        });
                }else{
                    $ionicLoading.hide();
                    $scope.message = x.error;
                }
            })
            .error(function(err){
                $ionicLoading.hide();
                $scope.message = "Error in connection. Please try again";
            });
        }

    ionic.material.ink.displayEffect();
});
