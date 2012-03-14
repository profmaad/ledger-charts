var numberRegexp = /^[-0-9.,]*$/

function getAmount(s)
{
    var parts = s.split(' ');
    for( var i in parts)
    {
	if(numberRegexp.test(parts[i]))
	{
	    return parseFloat(parts[i]);
	}
    }
}
