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

  LEDGER_REST = "http://127.0.0.1:9292/rest"

  #HC
  REPORTS = [ {:name => 'Cashflow', :active => true, :id => "cashflow"} ]
  CHART_OPTIONS = {
    :type => 'column',
    :reportType => 'balance',
    :title => 'Cashflow',
    :yTitle => 'Value',
    :legend => false,
    :timeStep => 'month',
    :timeSpan => {
      :startMonth => 4,
      :startYear => 2010,
      :endMonth => 3,
      :endYear => 2012
    }
  }

  get '/js/chart_options.js' do
    content_type 'text/javascript'
    erb :'chart_options.js'
  end

  get '/' do
    @reports = REPORTS
    @report_name = "Index"
    haml :index
  end

  get '/:report' do
    @reports = REPORTS
    @report_name = "Cashflow"
    @chart_options = CHART_OPTIONS
    haml :report
  end

  helpers do
  end
end
