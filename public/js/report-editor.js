$('#report-editor').submit( function() {
    $.ajax({
	type: 'POST',
	url: baseURL+'editor',
	data: "report="+JSON.stringify($(this).formParams()),
	success: function(msg) {
	    window.location = baseURL;
	},
	error: function(jqXHR, textStatus, errorThrown) {
	    alert("Error: "+jqXHR.responseText);
	},
    });
    return false;
});
