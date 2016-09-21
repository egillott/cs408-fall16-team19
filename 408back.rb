require 'sinatra'
require 'json'


set :public_folder, '.'

get "/" do
	File.read(File.join('.', 'index.html'))
	#redirect '/index.html'
	# send_file 'index.html'
  #  send_file 'food2.jpg'
   #   send_file 'food-fact1.jpg'


end

get "/message/:uid/:msg" do 
	#arguments = params[:arguments].to_s
	send = { person: => "#{params[:uid]}", message: =>  "#{params[:msg}"}.to_json
end

