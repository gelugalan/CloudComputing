const http = require('http');
const url = require('url');
const fs = require('fs');

const PORT = 3000;
const DATA_FILE = 'data.json';

let users = [];
let projects = [];


fs.readFile(DATA_FILE, (err, data) => {
  if (err) {
    console.error("Error reading data file:", err);
    return;
  }
  const jsonData = JSON.parse(data);
  users = jsonData.users || [];
  projects = jsonData.projects || [];
});


function saveDataToFile() {
  const jsonData = JSON.stringify({ users, projects });
  fs.writeFile(DATA_FILE, jsonData, (err) => {
    if (err) {
      console.error("Error writing data to file:", err);
    }
  });
}

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);

  // GET /users
  if (req.method === 'GET' && parsedUrl.pathname === '/users') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(users));
  }

  // POST /users
  else if (req.method === 'POST' && parsedUrl.pathname === '/users') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      const newUser = JSON.parse(body);
      users.push(newUser);
      saveDataToFile();
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(newUser));
    });
  }

  // GET /projects
  else if (req.method === 'GET' && parsedUrl.pathname === '/projects') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(projects));
  }

  // POST /projects
  else if (req.method === 'POST' && parsedUrl.pathname === '/projects') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      const newProject = JSON.parse(body);
      projects.push(newProject);
      saveDataToFile();
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(newProject));
    });
  }

 
  else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
