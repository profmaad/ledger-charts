function createBalanceChart(options, is_budget)
{
    var generalDataFunction;
    var dataFunction;
    var categories;
    var series;
    var periods;
    
    var result = generateTimePeriods(options.timeStep, options.timeSpan);
    periods = result[0];
    categories = result[1];

    generalDataFunction = function(series, query, field, modifier, periods, account_name, is_budget)
    {
	return function() {
	    return requestBalanceData(series, query, field, modifier, periods, account_name, is_budget);
	    };
    };

    var dataFunctions = [];
    series = [];
    for( var i in options.series )
    {
	var modifier = (options.series[i].modifier ? new Function("value", "budget", "return "+options.series[i].modifier+";") : new Function("value", "budget", "return value;") );

	if(options.series[i].field == 'total')
	{
	    series.push( {
		name: options.series[i].title,
		data: [],
	    });	

	    dataFunctions.push( function(index, query, field, modifier, periods, account_name, is_budget) {
		return generalDataFunction(index , query, field, modifier, periods, account_name, is_budget);
	    }(series.length-1, options.series[i].query, options.series[i].field, modifier, periods.slice(0), undefined, is_budget)
			      );
	}
	else if(options.series[i].field == 'accounts')
	{
	    var accounts_msg = $.ajax(
		{
		    type: 'POST',
		    url: ledgerRestUri+'/accounts',
		    data: 'query='+options.series[i].query,
		    async: false,
		});

	    accounts = $.parseJSON(accounts_msg.responseText);
	    if(accounts_msg.status != 200 || !accounts)
	    {
		alert("Failed to get list of accounts");
		return undefined;
	    }
	    accounts = accounts.accounts;
	    
	    for( var a in accounts)
	    {
		series.push( {
		    name: options.series[i].title + " :: " + accounts[a],
		    data: [],
		});

		dataFunctions.push( function(index, query, field, modifier, periods, account_name, is_budget) {
		    return generalDataFunction(index , query, field, modifier, periods, account_name, is_budget);
		}(series.length-1, options.series[i].query, options.series[i].field, modifier, periods.slice(0), accounts[a], is_budget)
				  );
	    }
	}
	else
	{
	    alert("unknown field: "+options.series[i].field);
	    return undefined;
	}
    }
    
    dataFunction = function() {
	for( var i in dataFunctions )
	{
	    dataFunctions[i]();
	}
    };

    return createHighchart(options, series, dataFunction, categories);
}

function getFieldTotal(response, is_budget)
{
    if(is_budget) { return response.total_amount; }
    else { return response.total; }
}
function getFieldAmount(account, is_budget)
{
    if(is_budget) { return account.amount; }
    else { return account; }
}

function requestBalanceData(series, query, field, modifier, periods, account_name, is_budget)
{
    $.ajax(
	{
	    type: 'POST',
	    url: ledgerRestUri+(is_budget ? '/budget' : '/balance'),
	    data: 'query=-p "'+periods[0]+'" '+query,
	    success: function(msg)
	    {
		response = $.parseJSON(msg)
		if(response)
		{
		    if(field == 'total')
		    {
			var total = 0;
			var total_budget = undefined;
			var total_raw = getFieldTotal(response, is_budget);
			if(!total_raw)
			{
			    for( var account in response.accounts )
			    {
				total = getAmount(getFieldAmount(response.accounts[account], is_budget));
				if(is_budget) { total_budget = getAmount(response.accounts[account].budget); }
				break;
			    }
			}
			else
			{
			    total = getAmount(total_raw);
			    if(is_budget) { total_budget = getAmount(response.total_budget); }
			}
			
			total = modifier(total, total_budget);
			
			if(isFinite(total))
			{
			    chart.series[series].addPoint(total, false);
			}
		    }
		    else if(field == 'accounts')
		    {
			if(!response.accounts)
			{
			    alert("Received invalid reply from ledger-rest, missing field 'accounts'");
			    loading_finished_callback();
			    return undefined;
			}

			var amount = 0;
			var budget = undefined;
			if(response.accounts[account_name])
			{
			    amount = getAmount(getFieldAmount(response.accounts[account_name], is_budget));
			    if(is_budget) { budget = getAmount(response.accounts[account_name].budget); }
			}

			amount = modifier(amount, budget);
			if(isFinite(amount))
			{
			    chart.series[series].addPoint(amount, false);
			}
		    }
		    else
		    {
			alert("unknown field: "+field);
			loading_finished_callback();
			return undefined;
		    }
		}
		
		periods.shift();
		if(!periods.length == 0)
		{
		    requestBalanceData(series, query, field, modifier, periods, account_name, is_budget);
		}
		else
		{
		    loading_finished_callback();
		}
	    }
	}
    );
}
