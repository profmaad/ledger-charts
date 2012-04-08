# ledger-charts - generate fancy charts out of your ledger data

ledger-charts is a web app to generate charts out of your ledger data.
It uses ledger-rest to access the data.

Charting is done via HighCharts, also uses jQuery and Twitter Bootstrap.

It supports balance, budget and register reports as well as most chart typesHighCharts provides. An exception are pie charts, because the current implementation doesn't provide useful data layouts for those.

## What you need

* ledger-rest (https://github.com/profmaad/ledger-rest)
* sinatra
