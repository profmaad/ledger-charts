var chartCashflow;

$(document).ready(
    function()
    {
	chartCashflow = new Highcharts.Chart( //HC
	    {
		chart:
		{
		    renderTo: 'chart-canvas',
		    type: 'column', //HC
//		    events: { load: requestDataForCurrentYear }
		    events: { load: requestData(4, 2010, 3, 2012) } //HC
		},
		title:
		{
		    text: 'Cashflow' // HC
		},
		xAxis:
		{
		    categories: generateCategoriesForTimespan(4, 2010, 3, 2012), //HC
		    labels: { rotation: -45, y: 30 } //HC
		},
		yAxis:
		{
		    title: { text: 'Value' } //HC
		},
		legend:
		{
		    enabled: false //HC
		},
		series: 
		[
		    {
			name: 'Cashflow', //HC
			data: []
		    }
		]
	    }
	);
    }
);

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

function requestData(month, year, end_month, end_year)
{
    $.ajax(
	{
	    type: 'POST',
	    url: 'http://localhost:4567/balance', //HC
	    data: 'query=-p '+year+'/'+month+' impuls', //HC
	    success: function(msg)
	    {
		response = $.parseJSON(msg)
		if(response)
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
		
		    chartCashflow.series[0].addPoint(total, true); //HC
		}

		if((year < end_year && month < 12) || (year == end_year && month < end_month)) { requestData(month+1, year, end_month, end_year); }
		else if (year < end_year && month == 12) { requestData(1, year+1, end_month, end_year); }
	    }
	}
    );
}
