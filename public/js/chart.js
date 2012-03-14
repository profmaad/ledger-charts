function createChart(options)
{
    switch(options.reportType)
    {
    case 'balance':
	return createBalanceChart(options);
	break;
    default:
	alert("unimplemented report type: "+options.reportType);
	return undefined;
    }
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
