require 'sinatra'
require 'json'



get '/' do
  halt erb(:login) unless params[:user]
  erb :chat, :locals => { 
    :user => params[:user].gsub(/\W/, '')
     }
end

connected = []
post '/' do
  connected.each { |out|
   out << "data: #{params[:msg]}\n\n"
     }
end

get '/stream', :provides => 'text/event-stream' do
  stream :keep_open do |out|
    connected << out
    out.callback { 
      connected.delete(out) 
    }
  end
end



__END__

@@ layout
<html>
  <head>
    <title>Chat Screen </title>
    <meta charset="utf-8" />
    <script src="http://ajax.googleapis.com/ajax/libs/jquery/1/jquery.min.js"></script>
  </head>
  <body><%= yield %></body>
</html>

@@ login
<form action='/'>
  <label for='user'>User Name:</label>
  <input name='user' value='' />
  <input type='submit' value="GO!" />
</form>

@@ chat
<pre id='chat'></pre>
<form>
  <input id='msg' placeholder='type message here...' />
</form>

<script>
  // reading
  var es = new EventSource('/stream');
  es.onmessage = function(e) { $('#chat').append(e.data + "\n") };
  // writing
  $("form").on('submit',function(e) {
    $.post('/', {msg: "<%= user %>: " + $('#msg').val()});
    $('#msg').val(''); $('#msg').focus();
    e.preventDefault();
  });
</script>