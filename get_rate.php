<?php
	$rate = null;

	$data = [
		'service' => 'loadInitialValues'
	];
	$date = getDateFromXML(getDataXML($data));

	$data = array(
		'service' => 'getExchngRateDetails',
		'baseCurrency' => 'USD',
		'settlementDate' => $date
	);
	$xml = getDataXML($data);
	if (!$xml) {
		$xml = getDataXML($data);
		if (!$xml) {
			$xml = getDataXML($data);
		}
	}

	if ($xml && count($xml->TRANSACTION_CURRENCY->children()) > 0) {
		$rate = getRateFromXML($xml);
	}
	
	die(json_encode(['rate' => $rate, 'date' => $date]));

	function getDataXML($data)
	{
		$url = 'https://www.mastercard.com/psder/eu/callPsder.do';
		$options = array(
		    'http' => array(
		        'header'  => "Content-type: application/x-www-form-urlencoded\r\nConnection: close\r\n",
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

	function getDateFromXML($xml)
	{
		return (string)$xml->SETTLEMENT_DATE;
	}