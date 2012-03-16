$('#report-editor').submit( function() {
    alert(JSON.stringify($(this).formParams(), null, 2));
    return false;
});

function testForm()
{
    var form = $('#report-editor');
    
    alert("hi there");
}