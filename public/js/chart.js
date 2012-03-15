function createChart(options)
{
    switch(options.reportType)
    {
    case 'balance':
	return createBalanceChart(options, false);
	break;
    case 'budget':
	return createBalanceChart(options, true);
    case 'register':
	return createRegisterChart(options);
    default:
	alert("unimplemented report type: "+options.reportType);
	return undefined;
    }
}


function createHighchart(options, series, dataFunction, categories)
{
    var chart_options = {
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
    };

    switch(options.stacked)
    {
    case true:
    case 'normal':
	chart_options['plotOptions'] = {};
	chart_options['plotOptions'][options.type] = {
	    stacking: 'normal',
	};
	break;
    case 'percent':
	chart_options['plotOptions'] = {};
	chart_options['plotOptions'][options.type] = {
	    stacking: 'percent',
	};
	break;
    }
    
    finished_series = 0;
    var chart = new Highcharts.Chart(chart_options);
    chart.showLoading("Loading data...");
    
    return chart;
}

var finished_series;
function loading_finished_callback(num_series)
{
    finished_series += num_series;
    if(finished_series >= chart.series.length)
    {
	chart.redraw();
	chart.hideLoading();
    }
}