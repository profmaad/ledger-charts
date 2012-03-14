function createChart(options)
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

function createHighchart(options, series, dataFunction, categories)
{
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
		categories: categories,
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

function generateTimePeriods(timeStep, timeSpan)
{
    switch(timeStep)
    {
    case 'year':
	return generateYearPeriods(timeSpan);
	break;
    case 'quarter':
	return generateQuarterPeriods(timeSpan);
	break;
    case 'month':
	return generateMonthPeriods(timeSpan);
	break;
    case 'week':
	return generateWeekPeriods(timeSpan);
	break;
    case 'day':
	return generateDayPeriods(timeSpan);
	break;
    default:
	alert("Unknown time step: "+timeStep);
	return [undefined, undefined];
    }
}
function generateYearPeriods(timeSpan)
{
    var result = []

    for ( var y = timeSpan.startYear; y <= timeSpan.endYear; y++)
    {
	result.push(y.toString());
    }

    return [result,result];
}
function generateQuarterPeriods(timeSpan)
{
    var periods = [];
    var categories = [];

    var y = timeSpan.startYear;
    var q = timeSpan.startQuarter;

    while(true)
    {
	var startMonth = 1+((q-1)*3);
	var endMonth = q*3;
	var endDay;
	switch(q)
	{
	case 1:
	case 4:
	    endDay = 31;
	    break;
	case 2:
	case 3:
	    endDay = 30;
	    break;
	}

	periods.push(y+"/"+startMonth+"/01 - "+y+"/"+endMonth+"/"+endDay);
	categories.push("Q"+q+" "+y);
	if((y < timeSpan.endYear && q < 4) || (y == timeSpan.endYear && q < timeSpan.endQuarter)) { q++; }
	else if (y < timeSpan.endYear && q == 4) { q = 1; y++; }
	else if (y >= timeSpan.endYear && q >= timeSpan.endQuarter) { break; }
    }

    return [periods,categories];
}
function generateMonthPeriods(timeSpan)
{
    var periods = [];
    var categories = [];

    var y = timeSpan.startYear;
    var m = timeSpan.startMonth;

    while(true)
    {
	periods.push(y+"/"+m);
	categories.push(m+"/"+y);
	if((y < timeSpan.endYear && m < 12) || (y == timeSpan.endYear && m < timeSpan.endMonth)) { m = m+1; }
	else if (y < timeSpan.endYear && m == 12) { m = 1; y = y+1; }
	else if (y >= timeSpan.endYear && m >= timeSpan.endMonth) { break; }
    }

    return [periods,categories];
}

function generateWeekPeriods(timeSpan) // I so dont want to implement this!
{
    return [[],[]];
}

function generateDayPeriods(timeSpan)
{
    var periods = [];
    var categories = [];

    var currentDate = new Date(timeSpan.startYear, timeSpan.startMonth-1, timeSpan.startDay);
    var endDate = new Date(timeSpan.endYear, timeSpan.endMonth-1, timeSpan.endDay);

    while(currentDate <= endDate)
    {
	periods.push(currentDate.getFullYear()+"/"+(currentDate.getMonth()+1)+"/"+currentDate.getDate());
	categories.push(currentDate.getDate()+"."+(currentDate.getMonth()+1)+"."+currentDate.getFullYear());
	currentDate.setTime(currentDate.getTime()+86400000);
    }

    return [periods,categories];
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
