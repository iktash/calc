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

			deferred.resolve(data.rate);
		}).error(function(data) {
			deferred.reject('error');
		});

		return deferred.promise;	
	}
});

main.service('Round', function() {
	this.round2 = function($n) {
		return Math.round($n * 100) / 100;
	}
});

main.controller("calc", function($scope, MastercardRate, Round) {
	$scope.rate = 0;
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
		var promise = MastercardRate.getRate();
		promise.then(function(rate) {
			$scope.rate = Number(rate);
			$scope.calcUAH();
			hideMessage();
			$scope.idle = false;
		}, function(error) {
			$scope.rate = 0;
			showMessage('Can not get exchange rate', true);
			$scope.idle = false;
		});
	}

	$scope.updateRate();
});