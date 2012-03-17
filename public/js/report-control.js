function deleteReport(id)
{
    $.ajax({
	type: 'DELETE',
	url: baseURL+'report/'+id,
	async: false
    });
}

$('#reportControlForm').ready( function() {
    var timeSpanStrings = timeSpanToUserStrings(chartOptions.timeSpan);

    $('#timeStep').val(chartOptions.timeStep);
    $('#timeSpan\\.start').val(timeSpanStrings[0]);
    $('#timeSpan\\.end').val(timeSpanStrings[1]);
});
$('#reportControlForm').submit( function() {
    chartOptions.timeStep = $('#timeStep').val();
    chartOptions.timeSpan = completeTimeSpan(stringsToTimeSpan($('#timeSpan\\.start').val(), $('#timeSpan\\.end').val()));

    chart.destroy();
    chart = createChart(chartOptions);
    
    return false;
});