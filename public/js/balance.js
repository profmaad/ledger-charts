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

    generalDataFunction = function(series, query, field, modifier, periods)
    {
	return function() {
	    return requestBalanceData(series, query, field, modifier, periods);
	    };
    };	
	
    var dataFunctions = [];
    series = [];
    for( var i in options.series )
    {
	series.push( {
	    name: options.series[i].title,
	    data: [],
	});	

	dataFunctions.push( function(index, query, field, modifier, periods) {
	    return generalDataFunction(index , query, field, modifier, periods);
	}(i, options.series[i].query, options.series[i].field, new Function("v", "return "+options.series[i].modifier+";"), periods.slice(0))
			  );
    }
    
    dataFunction = function() {
	for( var i in dataFunctions )
	{
	    dataFunctions[i]();
	}
    }

    return createHighchart(options, series, dataFunction, categories);
}

function requestBalanceData(series, query, field, modifier, periods)
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
			var total = 0
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
			
			chart.series[series].addPoint(total, true);
		    }
		    else
		    {
			alert("unknown field: "+field);
		    }
		}
		
		periods.shift();
		if(!periods.length == 0)
		{
		    requestBalanceData(series, query, field, modifier, periods);
		}
	    }
	}
    );
}
