$('#addSeriesModal').on('show', function() {
    $(':input[name="addSeries[title]"]').val('');
    $(':input[name="addSeries[query]"]').val('');
    $(':input[name="addSeries[field]"]').val('total');
    $(':input[name="addSeries[modifier]"]').val('');
});
$('#addSeriesSubmitButton').click( function() {
    var formData = $('#report-editor').formParams();
    var nextID = 0;
    if(formData['series'] != undefined)
    {
	while(formData['series'][nextID] != undefined)
	{
	    nextID++;
	}
    }

    $('#seriesTableBody').append('<tr>\n<td><input type="hidden" id="series['+nextID+'][title]" name="series['+nextID+'][title]" value="'+formData.addSeries.title+'" />'+formData.addSeries.title+'</td>\n<td><input type="hidden" id="series['+nextID+'][query]" name="series['+nextID+'][query]" value="'+formData.addSeries.query+'" />'+formData.addSeries.query+'</td>\n<td><input type="hidden" id="series['+nextID+'][field]" name="series['+nextID+'][field]" value="'+formData.addSeries.field+'" />'+formData.addSeries.field+'</td>\n<td><input type="hidden" id="series['+nextID+'][modifier]" name="series['+nextID+'][modifier]" value="'+formData.addSeries.modifier+'" />'+formData.addSeries.modifier+'</td>\n</tr>');

    $('#addSeriesModal').modal('hide');
});