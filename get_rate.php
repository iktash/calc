<?php
	$rate = null;

	$limit = 10;
	$days = 0;
	while ($days <= $limit) {
		$date = date("m/d/Y", strtotime("-{$days} days"));
		$xml = getDataXML($date);
		if (!$xml) {
			$xml = getDataXML($date);
			if (!$xml) {
				$xml = getDataXML($date);
			}
		}
		if ($xml && count($xml->TRANSACTION_CURRENCY->children()) > 0) {
			$rate = getRateFromXML($xml);
			break;
		} else {
			$days++;
		}
	}
	
	die(json_encode(['rate' => $rate]));

	function getDataXML($date)
	{
		$url = 'https://www.mastercard.com/psder/eu/callPsder.do';
		$data = array(
			'service' => 'getExchngRateDetails',
			'baseCurrency' => 'USD',
			'settlementDate' => $date
		);

		$options = array(
		    'http' => array(
		        'header'  => "Content-type: application/x-www-form-urlencoded\r\n",
		        'method'  => 'POST',
		        'content' => http_build_query($data),
		    ),
		);
		$context  = stream_context_create($options);
		if (!$context) {
			return false;
		}
		$result = file_get_contents($url, false, $context);
		if (!$result) {
			return false;
		}

		return simplexml_load_string($result);
	}

	function getRateFromXML($xml)
	{
		foreach ($xml->TRANSACTION_CURRENCY->children() as $child) {
			if ($child->ALPHA_CURENCY_CODE == 'UAH') {
				return (string)$child->CONVERSION_RATE;
			}
		}

		return null;
	}