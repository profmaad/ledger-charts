$('#addSeriesModal').on('hidden', function() {
    $(':input[name="addSeries[title]"]').val('');
    $(':input[name="addSeries[query]"]').val('');
    $(':input[name="addSeries[field]"]').val('total');
    $(':input[name="addSeries[modifier]"]').val('');
});
$('#addSeriesSubmitButton').click( function() {
    var formData = $('#report-editor').formParams();
    var nextID = 0;

    var oldID = $(':input[name="addSeries[id]"]').val()

    if(oldID != undefined && oldID.length > 0)
    {
	$('#series\\['+oldID+'\\]').replaceWith('<tr id="series['+oldID+']">\n<td><input type="hidden" id="series['+oldID+'][title]" name="series['+oldID+'][title]" value="'+formData.addSeries.title+'" />'+formData.addSeries.title+'</td>\n<td><input type="hidden" id="series['+oldID+'][query]" name="series['+oldID+'][query]" value="'+formData.addSeries.query+'" />'+formData.addSeries.query+'</td>\n<td><input type="hidden" id="series['+oldID+'][field]" name="series['+oldID+'][field]" value="'+formData.addSeries.field+'" />'+formData.addSeries.field+'</td>\n<td><input type="hidden" id="series['+oldID+'][modifier]" name="series['+oldID+'][modifier]" value="'+formData.addSeries.modifier+'" />'+formData.addSeries.modifier+'</td>\n<td><div class="pull-right"><a href="#" onclick="editSeries('+oldID+'); return false;"><i class="icon-pencil" /></a><a href="#" onclick="deleteSeries('+oldID+'); return false;"><i class="icon-trash" /></a></div></td>\n</tr>');
    }
    else
    {
	if(formData['series'] != undefined)
	{
	    while(formData['series'][nextID] != undefined)
	    {
		nextID++;
	    }
	}
	
	$('#seriesTableBody').append('<tr id="series['+nextID+']">\n<td><input type="hidden" id="series['+nextID+'][title]" name="series['+nextID+'][title]" value="'+formData.addSeries.title+'" />'+formData.addSeries.title+'</td>\n<td><input type="hidden" id="series['+nextID+'][query]" name="series['+nextID+'][query]" value="'+formData.addSeries.query+'" />'+formData.addSeries.query+'</td>\n<td><input type="hidden" id="series['+nextID+'][field]" name="series['+nextID+'][field]" value="'+formData.addSeries.field+'" />'+formData.addSeries.field+'</td>\n<td><input type="hidden" id="series['+nextID+'][modifier]" name="series['+nextID+'][modifier]" value="'+formData.addSeries.modifier+'" />'+formData.addSeries.modifier+'</td>\n<td><div class="pull-right"><a href="#" onclick="editSeries('+nextID+'); return false;"><i class="icon-pencil" /></a><a href="#" onclick="deleteSeries('+nextID+'); return false;"><i class="icon-trash" /></a></div></td>\n</tr>');
    }

    $('#addSeriesModal').modal('hide');
});

function editSeries(id)
{
    $(':input[name="addSeries[id]"]').val(id);
    $(':input[name="addSeries[title]"]').val($(':input[name="series['+id+'][title]"]').val());
    $(':input[name="addSeries[query]"]').val($(':input[name="series['+id+'][query]"]').val());
    $(':input[name="addSeries[field]"]').val($(':input[name="series['+id+'][field]"]').val());
    $(':input[name="addSeries[modifier]"]').val($(':input[name="series['+id+'][modifier]"]').val());

    $('#addSeriesModal').modal();
}
function deleteSeries(id)
{
    $('#series\\['+id+'\\]').remove();
}