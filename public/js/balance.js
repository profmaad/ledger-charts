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

    generalDataFunction = function(title, query, field, modifier, periods, period_index, series_ids, is_budget)
    {
	return function() {
	    return requestBalanceData(title, query, field, modifier, periods, period_index, series_ids, is_budget);
	    };
    };

    var dataFunctions = [];
    series = [];
    for( var i in options.series )
    {
	var modifier = (options.series[i].modifier ? new Function("value", "budget", "return "+options.series[i].modifier+";") : new Function("value", "budget", "return value;") );

	dataFunctions.push( function(title, query, field, modifier, periods, period_index, series_ids, is_budget) {
	    return generalDataFunction(title , query, field, modifier, periods, period_index, series_ids, is_budget);
	}(options.series[i].title, options.series[i].query, options.series[i].field, modifier, periods, 0, {}, is_budget)
			  );
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

function getSeries(series_ids, title, account)
{
    var name = title;
    if(!account) { account = "total" }
    else
    {
	name = (title.length == 0) ? account : (title + " :: "+account);

    }

    if(series_ids[account] == undefined)
    {
	chart.addSeries( {
	    name: name,
	    data: [],
	});
	
	series_ids[account] = chart.series.length-1;
    }

    return series_ids[account];
}

function requestBalanceData(title, query, field, modifier, periods, period_index, series_ids, is_budget)
{
    $.ajax(
	{
	    type: 'GET',
	    url: ledgerRestUri+(is_budget ? '/budget' : '/balance'),
	    data: 'query=-p "'+periods[period_index]+'" '+query,
	    success: function(msg)
	    {
		response = $.parseJSON(msg)
		if(!response)
		{
		    alert("Received invalid reply from ledger-rest, not valid JSON");
		    loading_finished_callback();
		    return undefined;
		}

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

		    var total_series = getSeries(series_ids, title, undefined);

		    if(isFinite(total))
		    {
			chart.series[total_series].addPoint([period_index, total], false);
		    }
		    else
		    {
			chart.series[total_series].addPoint([period_index, 0], false);
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

		    for( var account in response.accounts)
		    {		    
			var amount = 0;
			var budget = undefined;
			if(response.accounts[account])
			{
			    amount = getAmount(getFieldAmount(response.accounts[account], is_budget));
			    if(is_budget) { budget = getAmount(response.accounts[account].budget); }
			}
			
			amount = modifier(amount, budget);

			var account_series = getSeries(series_ids, title, account);			
						       
			if(isFinite(amount))
			{
			    chart.series[account_series].addPoint([period_index, amount], false);
			}
			else
			{
			    chart.series[account_series].addPoint([period_index, 0], false);
			}
		    }
		}
		else
		{
		    alert("unknown field: "+field);
		    loading_finished_callback();
		    return undefined;
		}
		
		period_index++;
		if(period_index < periods.length)
		{
		    requestBalanceData(title, query, field, modifier, periods, period_index, series_ids, is_budget);
		}
		else
		{
		    loading_finished_callback(Object.keys(series_ids).length);
		}
	    }
	}
    );
}
