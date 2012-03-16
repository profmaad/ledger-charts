$('#report-editor').submit( function() {
    var url = baseURL+'report';
    var formData = $(this).formParams();
    
    if(formData.id != undefined)
    {
	url += '/'+formData.id
    }

    $.ajax({
	type: 'POST',
	url: url,
	data: "report="+JSON.stringify(formData),
	success: function(msg) {
	    window.location = baseURL+'report/'+msg;
	},
	error: function(jqXHR, textStatus, errorThrown) {
	    alert("Error: "+jqXHR.responseText);
	},
    });
    return false;
});
