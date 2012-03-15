# -*- coding: utf-8 -*-
require 'rubygems'
require 'json'
require 'haml'

require 'sinatra/base'

class LedgerCharts < Sinatra::Base
  VERSION = "0.0"

  LEDGER_REST_URI = "http://127.0.0.1:9292/rest" # HC

  set :ledger_rest_uri, LEDGER_REST_URI

  #HC
  REPORTS = [ {:name => 'Cashflow', :active => true, :id => "cashflow"} ]
  CHART_OPTIONS = [
                   {
                     :type => 'column',
                     :reportType => 'balance',
                     :title => 'Cashflow',
                     :yTitle => 'Amount spend',
                     :legend => true,
                     :stacked => 'percent',
                     :timeStep => 'month',
                     :timeSpan => {
                       :startMonth => 4,
                       :startYear => 2010,
                       :endMonth => 3,
                       :endYear => 2012
                     },
                     :series => [
                                 {
                                   :title => "Impulsausgaben",
                                   :query => "impuls",
                                   :field => "total",
                                   :modifier => "-v",
                                 },
                                 {
                                   :title => "Einkäufe",
                                   :query => "einkäufe",
                                   :field => "total",
                                   :modifier => "-v",
                                 },
                                ],
                   },
                   {
                     :type => 'column',
                     :reportType => 'balance',
                     :title => 'Expenses',
                     :yTitle => 'Amount spend',
                     :legend => true,
                     :stacked => true,
                     :timeStep => 'month',
                     :timeSpan => {
                       :startMonth => 4,
                       :startYear => 2010,
                       :endMonth => 3,
                       :endYear => 2012
                     },
                     :series => [
                                 {
                                   :title => "Umlaufvermögen",
                                   :query => "umlauf",
                                   :field => "accounts",
                                   :modifier => "-v",
                                 },
                                ],
                   },
                  ]

  get '/' do
    @reports = REPORTS
    @report_name = "Index"
    haml :index
  end

  get '/:report' do
    @reports = REPORTS
    @report_name = "Cashflow"
    @chart_options = CHART_OPTIONS[1]
    haml :report
  end

  helpers do
  end
end
