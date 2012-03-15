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
    
    series_to_load = chart_options.series.length;
    var chart = new Highcharts.Chart(chart_options);
    chart.showLoading("Loading data...");
    
    return chart;
}

var series_to_load;
function loading_finished_callback()
{
    series_to_load--;
    if(series_to_load <= 0)
    {
	chart.redraw();
	chart.hideLoading();
    }
}