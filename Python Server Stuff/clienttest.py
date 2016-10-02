import sys
import socket


if len(sys.argv) < 2:
	PORT = 5043
else:
	PORT = int(sys.argv[1])


def handle_message(message):
	sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
	server_address = ('localhost', PORT)
	
#	print('Connected to localhost, port 5043')
	sock.connect(server_address)
	sock.sendall(message)
	sock.close()

def client_forever():
	print('serving on port: {port} ...'.format(port=PORT))
	while True:
		message = raw_input('whats your message? ')
		handle_message(message)


if __name__ == '__main__':
	client_forever()

