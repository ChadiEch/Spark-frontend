#!/usr/bin/env node

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// Get port from environment variable or default to 8080
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
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject'
};

// Create server
const server = http.createServer((req, res) => {
  console.log(`Request: ${req.method} ${req.url}`);
  
  // Parse the URL
  const parsedUrl = url.parse(req.url);
  let pathname = parsedUrl.pathname;
  
  // Default to index.html for root path
  if (pathname === '/') {
    pathname = '/index.html';
  }
  
  // Construct the full path
  const fullPath = path.join('./dist', pathname);
  const resolvedPath = path.resolve(fullPath);
  const distPath = path.resolve('./dist');
  
  // Security check to prevent directory traversal
  if (!resolvedPath.startsWith(distPath)) {
    console.log(`Forbidden access attempt: ${resolvedPath}`);
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('Forbidden');
    return;
  }
  
  // Get the file extension
  const ext = path.parse(resolvedPath).ext;
  
  console.log(`Serving file: ${resolvedPath} with extension: ${ext}`);
  
  // Read the file
  fs.readFile(resolvedPath, (err, data) => {
    if (err) {
      console.log(`File not found: ${resolvedPath}, error: ${err.code}`);
      // If file not found, serve index.html (for client-side routing)
      if (err.code === 'ENOENT') {
        fs.readFile('./dist/index.html', (err2, data2) => {
          if (err2) {
            console.log(`Error serving index.html: ${err2.message}`);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Internal Server Error');
          } else {
            console.log(`Serving index.html as fallback for: ${req.url}`);
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(data2);
          }
        });
      } else {
        console.log(`Error reading file: ${err.message}`);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
      }
    } else {
      // Set the content type
      const mimeType = mimeTypes[ext] || 'application/octet-stream';
      console.log(`Serving ${resolvedPath} with MIME type: ${mimeType}`);
      res.writeHead(200, { 'Content-Type': mimeType });
      res.end(data);
    }
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${PORT}/`);
  console.log(`Serving files from ${path.resolve('./dist')}`);
  
  // List files in dist directory for debugging
  fs.readdir('./dist', (err, files) => {
    if (err) {
      console.log('Error reading dist directory:', err.message);
    } else {
      console.log('Files in dist directory:', files);
      files.forEach(file => {
        if (fs.statSync(path.join('./dist', file)).isDirectory()) {
          fs.readdir(path.join('./dist', file), (err, subFiles) => {
            if (!err) {
              console.log(`Files in dist/${file}:`, subFiles);
            }
          });
        }
      });
    }
  });
  
  // Check if we have the essential files
  if (fs.existsSync('./dist/index.html')) {
    console.log('✓ Found index.html');
  } else {
    console.log('✗ Missing index.html');
  }
  
  if (fs.existsSync('./dist/assets')) {
    const assets = fs.readdirSync('./dist/assets');
    console.log(`✓ Found assets directory with ${assets.length} files`);
  } else {
    console.log('✗ Missing assets directory');
  }
});