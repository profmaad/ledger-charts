var chart;

$(document).ready(function()
		  {
		      chart = createChart(chartOptions);
		  }
		 );

function createChart(options)
{
    var generalDataFunction;
    var categoriesFunction;

    switch(options.timeStep)
    {
    case 'month':
	generalDataFunction = function(series, query, field, modifier)
	{
	    return function() {
		return requestData(series, options.reportType, query, field, modifier, options.timeSpan.startMonth, options.timeSpan.startYear, options.timeSpan.endMonth, options.timeSpan.endYear);
	    };
	};
	categoriesFunction = function()
	{
	    return generateCategoriesForTimespan(options.timeSpan.startMonth, options.timeSpan.startYear, options.timeSpan.endMonth, options.timeSpan.endYear);
	}
	break;
    case 'default':
	alert("unknown timeStep: "+options.timeStep);
	return undefined;
    }

    var dataFunctions = [];

    var series = [];
    for( var i in options.series )
    {
	series.push( {
	    name: options.series[i].title,
	    data: [],
	});	

	dataFunctions.push( function(index, query, field, modifier) {
	    return generalDataFunction(index , query, field, modifier);
	}(i, options.series[i].query, options.series[i].field, new Function("v", "return "+options.series[i].modifier+";"))
			  );
    }

    var dataFunction = function() {
	for( var i in dataFunctions )
	{
	    dataFunctions[i]();
	}
    }

    return new Highcharts.Chart(
	{
	    chart:
	    {
		renderTo: 'chart-canvas',
		type: options.type,
		events: { load: dataFunction }
	    },
	    title:
	    {
		text: options.title
	    },
	    xAxis:
	    {
		categories: categoriesFunction(),
		labels: { rotation: -45, y: 30 } //HC
	    },
	    yAxis:
	    {
		title: { text: options.yTitle }
	    },
	    legend:
	    {
		enabled: options.legend
	    },
	    series: series
	}
    );
}

function generateCategoriesForTimespan(start_month, start_year, end_month, end_year)
{
    var categories = []
    
    var m = start_month, y = start_year;

    while(true)
    {
	categories.push(m+"/"+y);
	if((y < end_year && m < 12) || (y == end_year && m < end_month)) { m = m+1; }
	else if (y < end_year && m == 12) { m = 1; y = y+1; }
	else if (y >= end_year && m >= end_month) { break; }
    }

    return categories;
}

function requestDataForCurrentYear()
{
    var date = new Date();
    return requestData(1, date.getFullYear(), date.getMonth()+1, date.getFullYear());
}
function requestDataForYear(year)
{
    var date = new Date();
    return requestData(1, year, 12, year);
}

function requestData(series, type, query, field, modifier, month, year, end_month, end_year)
{
    $.ajax(
	{
	    type: 'POST',
	    url: ledgerRestUri+'/'+type,
	    data: 'query=-p '+year+'/'+month+' '+query,
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

		if((year < end_year && month < 12) || (year == end_year && month < end_month)) { requestData(series, type, query, field, modifier, month+1, year, end_month, end_year); }
		else if (year < end_year && month == 12) { requestData(series, type, query, field, modifier, 1, year+1, end_month, end_year); }
	    }
	}
    );
}
