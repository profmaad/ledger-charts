require 'rubygems'
require 'json'
require 'haml'

require 'sinatra/base'

class LedgerCharts < Sinatra::Base
  if development?
    require 'sinatra/reloader'

    settings.bind = "127.0.0.1"
    settings.port = "4568"
  end

  VERSION = "0.0"

  LEDGER_REST = "http://localhost:4567"

  get '/' do
    @reports = {}
    @report_name = "Index"
    haml :index
  end

  get '/:report' do
    @reports = {}
    @report_name = "Cashflow"
    haml :report
  end

  helpers do
  end
end
