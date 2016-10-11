import socket
import sys
from threading import Thread, Lock
import thread
import threading


if len(sys.argv) < 2:
	PORT = 5043
else :
	PORT = int(sys.argv[1])
lock = threading.RLock()

connections = []
SERVER_ADDRESS = (HOST, PORT) = '', PORT
REQUEST_QUEUE_SIZE = 5


def start_threads():
	handler = threading.Thread(target=handle_requests)
	server = threading.Thread(target=serve_forever)
	try:
		handler.start()
		server.start()
	except (KeyboardInterrupt, SystemExit):
		handler.kill()
		server.kill()
  #	 	cleanup_stop_thread();
    	sys.exit()

def handle_requests():
	print 'handler started'
	while True:
		with lock:
			if  connections:	
				client_connection = connections.pop(0)
				request = client_connection.recv(1024)
				message = request.decode()
				client_connection.sendall(message)
				print message	
#			client_connection.sendall(http_response.format(HOST, PORT, message))
#		if message == 'exit':
#			break	




def serve_forever():
	print 'server started'
	listen_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
	listen_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
	listen_socket.bind(SERVER_ADDRESS)
	listen_socket.listen(REQUEST_QUEUE_SIZE)
	print('Serving HTTP on port {port} ...'.format(port=PORT))

	while True:
		client_connection, client_address = listen_socket.accept()
		with lock:
			connections.append(client_connection)
			
#		handle_request(client_connection)
#		client_connection.close()

if __name__ == '__main__':
	start_threads()
#	serve_forever()







