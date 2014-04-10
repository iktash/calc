var main = angular.module("main", []);

main.service('MastercardRate', function($http, $q) {
	this.getRate = function() {
		var deferred = $q.defer();

		$http({
			url: 'get_rate.php',
		}).success(function(data) {
			if (! data.rate) {
				deferred.reject('error');
			}

			deferred.resolve(data);
		}).error(function(data) {
			deferred.reject('error');
		});

		return deferred.promise;	
	}
});

main.service('StorageRate', function() {
	this.getRate = function(date) {
		var rate = localStorage.getItem(date);

		return Number(rate);
	}
	this.setRate = function(data) {
		localStorage.setItem(data.date, data.rate);
	}
});

main.service('Round', function() {
	this.round2 = function($n) {
		return Math.round($n * 100) / 100;
	}
});

main.service('CurrentDate', function($filter) {
	this.get = function() {
		var currentTime = new Date().getTime();
		currentTime = currentTime - 1000 * 60 * 60 * 24;
		var formattedDate = $filter('date')(currentTime, 'MM/dd/yyyy');

		return formattedDate;
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
		
		showMessage('Загрузка курса...', false);
		
		var promise = MastercardRate.getRate();
		promise.then(function(data) {
			$scope.rate = Number(data.rate);
			$scope.date = data.date;

			StorageRate.setRate(data);
			
			$scope.calcUAH();
			
			hideMessage();
			
			$scope.idle = false;
		}, function(error) {
			$scope.rate = 0;
			
			showMessage('Не удалось получить курс', true);
			
			$scope.idle = false;
		});
	}

	var rate = StorageRate.getRate($scope.date);
	if (! rate) {
		$scope.updateRate();
	} else {
		$scope.rate = Number(rate);
		$scope.calcUAH();
	}
});