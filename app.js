const http = require('http');
const url = require('url');
const querystring = require('querystring');

const dictionary = [];

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.statusCode = 204;
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url);
  if (req.method === 'GET' && parsedUrl.pathname === '/api/definitions') {
    const query = querystring.parse(parsedUrl.query);
    const word = query.word;
  
    if (!word) {
      res.statusCode = 400;
      res.end('Bad Request: Missing word parameter');
    } else {
      const definition = findDefinition(word);
      if (definition) {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ found: true, definition, numberOfRequest: dictionary.length + 1 }));
      } else {
        res.statusCode = 404;
        res.end(JSON.stringify({ found: false, numberOfRequest: dictionary.length + 1 }));
      }
    }
  }
  else if (req.method === 'POST' && parsedUrl.pathname === '/api/definitions') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });

    req.on('end', () => {
      const postData = querystring.parse(body);
      const word = postData.word;
      const definition = postData.definition;

      if (!word || !definition) {
        res.statusCode = 400;
        res.end('Bad Request: Missing word or definition');
      } else {
        const existingDefinition = findDefinition(word);
        if (existingDefinition) {
          res.end(`Warning! '${word}' already exists.`);
        } else {
          addDefinition(word, definition);
          console.log(`New word added: ${word}`);
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ message: `Request # ${dictionary.length}, New entry recorded: "${word} : ${definition}"` }));
        }
      }
    });
  } else {
    res.statusCode = 404;
    res.end('Not Found');
  }
});

const PORT = process.env.PORT || 3500;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

function findDefinition(word) {
  return dictionary.find((entry) => entry.word === word);
}

function addDefinition(word, definition) {
  dictionary.push({ word, definition });
}
