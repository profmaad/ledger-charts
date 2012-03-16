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
    @@reports[@@last_active][:active] = false unless (@@last_active.nil? or @@reports[@@last_active].nil?)
    @reports = @@reports
  end

  get '/' do
    @report_name = "Index"
    @@last_active = nil

    haml :index
  end

  get '/editor/?' do
    haml :'editor-reporttype'
  end
  get '/editor/new_:reporttype' do
    @report_id = nil
    @report_type = params[:reporttype]
    @report = {}
    @report[:series] = {}
    haml :editor
  end
  get '/editor/:id' do
    id = params[:id].to_i
    redirect url('/') if @@reports[id].nil?

    @report_id = id
    @report_type = @@reports[id][:reportType]
    @report = @@reports[id]
    haml :editor
  end

  get '/report/:id' do
    id = params[:id].to_i
    redirect url('/') if @reports[id].nil?

    @@last_active = id

    @report_id = id
    @reports[id][:active] = true
    @chart_options = @reports[id]
    @report_name = @chart_options[:title]

    haml :report
  end
  post '/report/?:id?' do
    begin
      reportJSON = URI.unescape(params[:report])
      if params[:id]
        id = params[:id].to_i
      else
        id = @@next_id
        @@next_id += 1
      end
      @@reports[id] = JSON.parse(reportJSON, :symbolize_names => true)
      IO.write(settings.reports_dir+"/#{id}.json", JSON.pretty_generate(@@reports[id]))

      return  [200, id.to_s]
    rescue Exception => e
      return [500, e.to_s]
    end
  end
  delete '/report/:id' do
    id = params[:id].to_i
    if @@reports[id]
      @@reports.delete(id)
      File.delete(settings.reports_dir+"/#{id}.json")

      return 200
    else 
      return [404, "No such report"]
    end
  end
end
