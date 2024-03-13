import http.server
import json
from urllib.parse import urlparse
import os

PORT = 3000
DATA_FILE = 'data.json'

users = []
projects = []


def load_data():
    global users, projects
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, 'r') as file:
            data = json.load(file)
            users = data.get('users', [])
            projects = data.get('projects', [])


def save_data():
    data = {'users': users, 'projects': projects}
    with open(DATA_FILE, 'w') as file:
        json.dump(data, file)

class CustomHandler(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        parsed_url = urlparse(self.path)

        if parsed_url.path == '/users':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(users).encode())

        elif parsed_url.path == '/projects':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(projects).encode())

        else:
            self.send_response(404)
            self.send_header('Content-type', 'text/plain')
            self.end_headers()
            self.wfile.write('Not Found'.encode())

    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        parsed_url = urlparse(self.path)

        if parsed_url.path == '/users':
            new_user = json.loads(post_data)
            users.append(new_user)
            save_data()
            self.send_response(201)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(new_user).encode())

        elif parsed_url.path == '/projects':
            new_project = json.loads(post_data)
            projects.append(new_project)
            save_data()
            self.send_response(201)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps(new_project).encode())

        else:
            self.send_response(404)
            self.send_header('Content-type', 'text/plain')
            self.end_headers()
            self.wfile.write('Not Found'.encode())

    def do_PUT(self):
        content_length = int(self.headers['Content-Length'])
        put_data = self.rfile.read(content_length)
        parsed_url = urlparse(self.path)

        if parsed_url.path.startswith('/users/'):
            user_id = parsed_url.path.split('/')[-1]
            for user in users:
                if str(user.get('id')) == user_id:
                    updated_user = json.loads(put_data)
                    user.update(updated_user)
                    save_data()
                    self.send_response(200)
                    self.send_header('Content-type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps(user).encode())
                    return

        elif parsed_url.path.startswith('/projects/'):
            project_id = parsed_url.path.split('/')[-1]
            for project in projects:
                if str(project.get('id')) == project_id:
                    updated_project = json.loads(put_data)
                    project.update(updated_project)
                    save_data()
                    self.send_response(200)
                    self.send_header('Content-type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps(project).encode())
                    return

        self.send_response(404)
        self.send_header('Content-type', 'text/plain')
        self.end_headers()
        self.wfile.write('Not Found'.encode())

    def do_DELETE(self):
        parsed_url = urlparse(self.path)

        if parsed_url.path.startswith('/users/'):
            user_id = parsed_url.path.split('/')[-1]
            for user in users:
                if str(user.get('id')) == user_id:
                    users.remove(user)
                    save_data()
                    self.send_response(200)
                    self.send_header('Content-type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps(user).encode())
                    return

        elif parsed_url.path.startswith('/projects/'):
            project_id = parsed_url.path.split('/')[-1]
            for project in projects:
                if str(project.get('id')) == project_id:
                    projects.remove(project)
                    save_data()
                    self.send_response(200)
                    self.send_header('Content-type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps(project).encode())
                    return

        self.send_response(404)
        self.send_header('Content-type', 'text/plain')
        self.end_headers()
        self.wfile.write('Not Found'.encode())

def run_server():
    load_data()
    server_address = ('', PORT)
    httpd = http.server.HTTPServer(server_address, CustomHandler)
    print(f'Server is listening on port {PORT}')
    httpd.serve_forever()

if __name__ == '__main__':
    run_server()
