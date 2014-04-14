var main = angular.module("main", ['ngQuickDate']);

main.service('MastercardRate', function($http, $q, $filter) {
	this.getRate = function(date) {
		date = $filter('date')(date, 'MM/dd/yyyy');
		var deferred = $q.defer();

		$http.post('get_rate.php', {'date': date})
			.success(function(data) {
				if (! data.rate) {
					deferred.reject('error');
				}

				deferred.resolve(data);
			}).error(function(data) {
				deferred.reject(data.settl_date);
			});

		return deferred.promise;	
	}
});

main.service('StorageRate', function($filter) {
	this.getRate = function(date) {
		date = $filter('date')(date, 'MM/dd/yyyy');

		var rate = localStorage.getItem(date);

		return Number(rate);
	}
	this.setRate = function(data) {
		var date = $filter('date')(data.date, 'MM/dd/yyyy');

		localStorage.setItem(date, data.rate);
	}
});

main.service('Round', function() {
	this.round2 = function($n) {
		return Math.round($n * 100) / 100;
	}
});

main.service('CurrentDate', function() {
	this.get = function() {
		var currentTime = new Date().getTime();
		yesterdayTime = currentTime - 1000 * 60 * 60 * 24;

		return new Date(yesterdayTime);
	}
});

main.controller("calc", function($scope, MastercardRate, StorageRate, Round, CurrentDate) {
	$scope.rate = 0;
	$scope.date = CurrentDate.get();
	$scope.coef = 1.035;
	$scope.addTax = 3.15;
	$scope.usd = 100;
	$scope.uah = 0;
	$scope.message = '';
	$scope.message_show = false
	$scope.error = false;
	$scope.idle = false;

	$scope.calcUSD = function() {
		$scope.usd = Round.round2($scope.uah / $scope.rate * $scope.coef + $scope.addTax);
	}

	$scope.calcUAH = function() {
		$scope.uah = Round.round2(($scope.usd - $scope.addTax) / $scope.coef * $scope.rate);
	}

	function showMessage(message, error) {
		$scope.message = message;
		$scope.message_show = true;
		$scope.error = error;
	}

	function hideMessage() {
		$scope.message_show = false;
	}

	$scope.updateRate = function() {
		$scope.idle = true;
		
		showMessage('Loading exchange rate...', false);
		
		var promise = MastercardRate.getRate($scope.date);
		promise.then(function(data) {
			data.date = new Date(data.date);
			$scope.rate = Number(data.rate);
			$scope.date = data.date;

			StorageRate.setRate(data);
			
			$scope.calcUAH();
			
			hideMessage();
			
			$scope.idle = false;
		}, function(settl_date) {
			$scope.rate = 0;

			$scope.date = settl_date;

			showMessage('Can not get the rate', true);
			
			$scope.idle = false;

			$scope.getRate();
		});
	}

	$scope.changeDate = function() {
		hideMessage();
		$scope.getRate();
	}

	$scope.getRate = function() {
		var rate = StorageRate.getRate($scope.date);
		if (! rate) {
			$scope.updateRate();
		} else {
			$scope.rate = Number(rate);
			$scope.calcUAH();
		}
	}

	$scope.getRate();
});