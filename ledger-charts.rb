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
                                   :modifier => "-value",
                                 },
                                 {
                                   :title => "Einkäufe",
                                   :query => "einkäufe",
                                   :field => "total",
                                   :modifier => "-value",
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
                                   :query => "impuls einkäufe laufend",
                                   :field => "accounts",
                                   :modifier => "-value",
                                 },
                                ],
                   },
                   {
                     :type => 'column',
                     :reportType => 'register',
                     :title => 'Register Test',
                     :yTitle => 'Amount',
                     :legend => true,
                     :stacked => true,
                     :timeSpan => {
                       :startDay => 1,
                       :startMonth => 4,
                       :startYear => 2010,
                       :endDay => 30,
                       :endMonth => 3,
                       :endYear => 2012
                     },
                     :series => {
                       :title => "Ausgaben",
                       :query => "^exp",
                       :field => "accounts",
                       :formatter => 'date',
                     },
                   },
                   {
                     :type => 'column',
                     :reportType => 'budget',
                     :title => 'Budgets',
                     :yTitle => 'Amount spend',
                     :legend => true,
                     :timeStep => 'month',
                     :timeSpan => {
                       :startMonth => 1,
                       :startYear => 2012,
                       :endMonth => 3,
                       :endYear => 2012
                     },
                     :series => [
                                 {
                                   :title => "Expenses",
                                   :query => "food",
                                   :field => "accounts",
                                   :modifier => "(value/budget)*100"
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
    @chart_options = CHART_OPTIONS[3]
    haml :report
  end

  helpers do
  end
end
