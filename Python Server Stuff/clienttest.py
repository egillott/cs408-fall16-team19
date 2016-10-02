import sys
import socket


def handle_message(message):
	sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
	server_address = ('localhost', 5043)
	
#	print('Connected to localhost, port 5043')
	sock.connect(server_address)
	sock.sendall(message)
	sock.close()

def client_forever():
	while True:
		message = raw_input('whats your message? ')
		handle_message(message)


if __name__ == '__main__':
	client_forever()

