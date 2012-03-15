function createBalanceChart(options)
{
    var generalDataFunction;
    var dataFunction;
    var categories;
    var series;
    var periods;
    
    var result = generateTimePeriods(options.timeStep, options.timeSpan);
    periods = result[0];
    categories = result[1];

    generalDataFunction = function(series, query, field, modifier, periods, account_name)
    {
	return function() {
	    return requestBalanceData(series, query, field, modifier, periods, account_name);
	    };
    };

    var dataFunctions = [];
    series = [];
    for( var i in options.series )
    {
	var modifier = (options.series[i].modifier ? new Function("v", "return "+options.series[i].modifier+";") : new Function("v", "return v;") );

	if(options.series[i].field == 'total')
	{
	    series.push( {
		name: options.series[i].title,
		data: [],
	    });	

	    dataFunctions.push( function(index, query, field, modifier, periods, account_name) {
		return generalDataFunction(index , query, field, modifier, periods, account_name);
	    }(series.length-1, options.series[i].query, options.series[i].field, modifier, periods.slice(0), undefined)
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

		dataFunctions.push( function(index, query, field, modifier, periods, account_name) {
		    return generalDataFunction(index , query, field, modifier, periods, account_name);
		}(series.length-1, options.series[i].query, options.series[i].field, modifier, periods.slice(0), accounts[a])
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
    }

    return createHighchart(options, series, dataFunction, categories);
}

function requestBalanceData(series, query, field, modifier, periods, account_name)
{
    $.ajax(
	{
	    type: 'POST',
	    url: ledgerRestUri+'/balance',
	    data: 'query=-p "'+periods[0]+'" '+query,
	    success: function(msg)
	    {
		response = $.parseJSON(msg)
		if(response)
		{
		    if(field == 'total')
		    {
			var total = 0;
			if(!response.total)
			{
			    for( var account in response.accounts )
			    {
				if( typeof(response.accounts[account]) == "string")
				{
				    total = getAmount(response.accounts[account]);
				    break;
				}
			    }
			}
			else
			{
			    total = getAmount(response.total);
			}
			
			total = modifier(total);
			
			chart.series[series].addPoint(total, false);
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
			if(response.accounts[account_name])
			{
			    amount = getAmount(response.accounts[account_name]);
			}

			amount = modifier(amount);
			chart.series[series].addPoint(amount, false);
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
		    requestBalanceData(series, query, field, modifier, periods, account_name);
		}
		else
		{
		    loading_finished_callback();
		}
	    }
	}
    );
}
