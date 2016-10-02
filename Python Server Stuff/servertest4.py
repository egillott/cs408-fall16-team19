import socket
import sys
import threading
import thread


if len(sys.argv) < 2:
	PORT = 5043
else :
	PORT = int(sys.argv[1])

connections = []
SERVER_ADDRESS = (HOST, PORT) = '', PORT
REQUEST_QUEUE_SIZE = 5


def start_threads():
	handler = threading.Thread(target=handle_request)
	server = threading.Thread(target=serve_forever)
	handler.start()
	server.start()


def handle_request():
	print 'handler started'
	while True:
		if  connections:	
			request = client
			request = client_connection.recv(1024)
			message = request.decode()
			print message
			client_connection.sendall(message)
			http_response = """\
		
HTTP/1.1 200 OK

Hello, World!
from host {0}
from port {1}
your message: {2} 


"""
	
		client_connection.sendall(http_response.format(HOST, PORT, message))
#		if message == 'exit':
#			break	




def serve_forever():
	listen_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
	listen_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
	listen_socket.bind(SERVER_ADDRESS)
	listen_socket.listen(REQUEST_QUEUE_SIZE)
	print('Serving HTTP on port {port} ...'.format(port=PORT))

	while True:
		client_connection, client_address = listen_socket.accept()
		connections.append(client_connection)
			
#		handle_request(client_connection)
		client_connection.close()

if __name__ == '__main__':
	start_threads()
#	serve_forever()




