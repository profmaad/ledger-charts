function generateTimePeriods(timeStep, timeSpan)
{
    switch(timeStep)
    {
    case 'year':
	return generateYearPeriods(timeSpan);
	break;
    case 'quarter':
	return generateQuarterPeriods(timeSpan);
	break;
    case 'month':
	return generateMonthPeriods(timeSpan);
	break;
    case 'week':
	return generateWeekPeriods(timeSpan);
	break;
    case 'day':
	return generateDayPeriods(timeSpan);
	break;
    default:
	alert("Unknown time step: "+timeStep);
	return [undefined, undefined];
    }
}
function generateYearPeriods(timeSpan)
{
    var result = []

    for ( var y = timeSpan.startYear; y <= timeSpan.endYear; y++)
    {
	result.push(y.toString());
    }

    return [result,result];
}
function generateQuarterPeriods(timeSpan)
{
    var periods = [];
    var categories = [];

    var y = timeSpan.startYear;
    var q = timeSpan.startQuarter;

    while(true)
    {
	var startMonth = 1+((q-1)*3);
	var endMonth = q*3;
	var endDay;
	switch(q)
	{
	case 1:
	case 4:
	    endDay = 31;
	    break;
	case 2:
	case 3:
	    endDay = 30;
	    break;
	}

	periods.push(y+"/"+startMonth+"/01 - "+y+"/"+endMonth+"/"+endDay);
	categories.push("Q"+q+" "+y);
	if((y < timeSpan.endYear && q < 4) || (y == timeSpan.endYear && q < timeSpan.endQuarter)) { q++; }
	else if (y < timeSpan.endYear && q == 4) { q = 1; y++; }
	else if (y >= timeSpan.endYear && q >= timeSpan.endQuarter) { break; }
    }

    return [periods,categories];
}
function generateMonthPeriods(timeSpan)
{
    var periods = [];
    var categories = [];

    var y = timeSpan.startYear;
    var m = timeSpan.startMonth;

    while(true)
    {
	periods.push(y+"/"+m);
	categories.push(m+"/"+y);
	if((y < timeSpan.endYear && m < 12) || (y == timeSpan.endYear && m < timeSpan.endMonth)) { m = m+1; }
	else if (y < timeSpan.endYear && m == 12) { m = 1; y = y+1; }
	else if (y >= timeSpan.endYear && m >= timeSpan.endMonth) { break; }
    }

    return [periods,categories];
}

function generateWeekPeriods(timeSpan) // I so dont want to implement this!
{
    return [[],[]];
}

function generateDayPeriods(timeSpan)
{
    var periods = [];
    var categories = [];

    var currentDate = new Date(timeSpan.startYear, timeSpan.startMonth-1, timeSpan.startDay);
    var endDate = new Date(timeSpan.endYear, timeSpan.endMonth-1, timeSpan.endDay);

    while(currentDate <= endDate)
    {
	periods.push(currentDate.getFullYear()+"/"+(currentDate.getMonth()+1)+"/"+currentDate.getDate());
	categories.push(currentDate.getDate()+"."+(currentDate.getMonth()+1)+"."+currentDate.getFullYear());
	currentDate.setTime(currentDate.getTime()+86400000);
    }

    return [periods,categories];
}
