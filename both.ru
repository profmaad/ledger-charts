$: << "."

require 'ledger-charts.rb'
require '../ledger-rest/ledger-rest.rb'

run Rack::URLMap.new( "/charts" => LedgerCharts.new, "/rest" => LedgerRest.new )
