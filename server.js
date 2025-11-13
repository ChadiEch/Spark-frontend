#!/usr/bin/env node

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 8080;

// MIME types
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

// Create server
const server = http.createServer((req, res) => {
  console.log(`Request: ${req.method} ${req.url}`);
  
  // Parse the URL
  const parsedUrl = url.parse(req.url);
  let pathname = `.${parsedUrl.pathname}`;
  
  // Default to index.html for root path
  if (pathname === './') {
    pathname = './dist/index.html';
  }
  
  // Serve files from dist directory
  if (!pathname.startsWith('./dist')) {
    pathname = `./dist${pathname}`;
  }
  
  // Resolve the full path
  const fullPath = path.resolve(pathname);
  const distPath = path.resolve('./dist');
  
  // Security check to prevent directory traversal
  if (!fullPath.startsWith(distPath)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('Forbidden');
    return;
  }
  
  // Get the file extension
  const ext = path.parse(fullPath).ext;
  
  // Read the file
  fs.readFile(fullPath, (err, data) => {
    if (err) {
      // If file not found, serve index.html (for client-side routing)
      if (err.code === 'ENOENT') {
        fs.readFile('./dist/index.html', (err2, data2) => {
          if (err2) {
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Internal Server Error');
          } else {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(data2);
          }
        });
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
      }
    } else {
      // Set the content type
      const mimeType = mimeTypes[ext] || 'text/plain';
      res.writeHead(200, { 'Content-Type': mimeType });
      res.end(data);
    }
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${PORT}/`);
});