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
    var by_payee = {};

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

	if(!by_payee[posting.payee]) { by_payee[posting.payee] = []; }
	by_payee[posting.payee].push(posting);

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

    for( var payee in by_payee )
    {
	var p = by_payee[payee];
	if(p.length == 0) { continue; }

	var category = formatter(p[0].date, p[0].value_date, p[0].payee);
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
	    for(var i in p )
	    {		
		var amount = modifier(getAmount(p[i].amount));

		series[p[i].account].data.push([categories.length-1, amount]);
	    }
	}
    }

    chart.xAxis[0].setCategories(categories);
    for( var s in series )
    {
	chart.addSeries(series[s], false);
    }
}
