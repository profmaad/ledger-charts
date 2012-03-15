function createRegisterChart(options)
{
    var dataFunction = function(series_options) {
	return function() {
	    return requestRegisterData(series_options);
	}
    }(options.series);
    
    return createHighchart(options, [], dataFunction, []);
}

function requestRegisterData(series_options)
{
    $.ajax(
	{
	    type: 'POST',
	    url: ledgerRestUri+'/register',
	    data: 'query='+series_options.query,
	    success: function(msg)
	    {
		response = $.parseJSON(msg)
		if(!response)
		{
		    alert("Received invalid reply from ledger-rest, not valid JSON");		    
		}
		else if(!response.postings)
		{
		    alert("Received invalid reply from ledger-rest, missing field 'postings'");	    
		}
		else
		{
		    handleRegisterData(response.postings, series_options);
		}

		loading_finished_callback();
	    }
	}
    );
}

// total: sort by payee, sum up when same payee
// accounts: one series per account
function handleRegisterData(postings, series_options)
{
    var series = {};
    var total_series;
    var categories = [];
    var by_category = {};

    var modifier = (series_options.modifier ? new Function("v", "return "+series_options.modifier+";") : new Function("v", "return v;") );
    var formatter = (series_options.formatter ? new Function("date", "value_date", "payee", "return "+series_options.formatter+";") : new Function("date", "value_date", "payee", "return payee;") );

    if(series_options.field == "total")
    {
	series[series_options.title] = {
	    name: series_options.title,
	    data: [],
	};
	total_series = series[series_options.title];
    }

    for( var i in postings )
    {
	var posting = postings[i];
	var category = formatter(posting.date, posting.value_date, posting.payee);

	if(!by_category[category]) { by_category[category] = []; }
	by_category[category].push(posting);

	if(series_options.field == "accounts")
	{	    
	    if(!series[posting.account])
	    {
		series[posting.account] = {
		    name: series_options.title + " :: "+posting.account,
		    data: [],
		};
	    }
	}
    }

    for( var category in by_category )
    {
	var p = by_category[category];
	if(p.length == 0) { continue; }

	categories.push(category);

	if(series_options.field == "total")
	{
	    var amount = 0;

	    for( var i in p )
	    {
		amount += getAmount(p[i].amount);
	    }

	    amount = modifier(amount);

	    total_series.data.push([categories.length-1, amount]);
	}
	else if(series_options.field == "accounts")
	{
	    var amounts = {};

	    for( var i in p )
	    {
		if(!amounts[p[i].account]) { amounts[p[i].account] = 0; }
		amounts[p[i].account] += getAmount(p[i].amount);
	    }
	    
	    for( var a in amounts )
	    {		
		series[a].data.push([categories.length-1, modifier(amounts[a])]);
	    }
	}
    }

    chart.xAxis[0].setCategories(categories);
    for( var s in series )
    {
	chart.addSeries(series[s], false);
    }
}
