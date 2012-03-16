# -*- coding: utf-8 -*-
require 'rubygems'
require 'json'
require 'yaml'
require 'haml'

require 'sinatra/base'

class LedgerCharts < Sinatra::Base
  VERSION = "0.0"

  CONFIG_FILE = "ledger-charts.yml"

  set :ledger_rest_uri, "http://127.0.0.1:9292/rest"
  set :reports_dir, "data/reports"

  configure do |c|
    config = YAML.load_file(CONFIG_FILE)
    puts "Failed to load config file" if config.nil?

    config.each do |key,value|
      set key.to_sym, value
    end

    @@reports = {}
    @@next_id = 0
    @@last_active = nil    

    Dir[settings.reports_dir+"/*.json"].each do |file|
      id = File.basename(file).to_i
      report = JSON.parse(IO.read(file), :symbolize_names => true)
      
      report[:active] = false
      
      @@reports[id] = report
      
      @@next_id = id if (id > @@next_id)
    end

    @@next_id += 1
  end

  before do
    @@reports[@@last_active][:active] = false unless @@last_active.nil?
    @reports = @@reports
  end

  get '/' do
    @report_name = "Index"
    @@last_active = nil

    haml :index
  end

  get '/editor' do
    haml :editor
  end

  get '/report/:id' do
    id = params[:id].to_i

    @@last_active = id

    @reports[id][:active] = true
    @chart_options = @reports[id]
    @report_name = @chart_options[:title]

    haml :report
  end
end
