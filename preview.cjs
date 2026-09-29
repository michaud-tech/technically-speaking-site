// Local preview: node preview.cjs, then open http://localhost:4176/learn.html.
// Optional ANTHROPIC_API_KEY and ANTHROPIC_MODEL environment variables enable live coaching.
const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.mp3':'audio/mpeg','.txt':'text/plain; charset=utf-8'};
http.createServer(async(req,res)=>{
  const pathname=new URL(req.url,'http://localhost').pathname;
  if(['/api/assess','/api/practice','/api/conversation'].includes(pathname)){
    let body='';for await(const chunk of req){body+=chunk;if(body.length>40000){res.writeHead(413);res.end('Request too large');return;}}
    req.body=body;res.status=n=>{res.statusCode=n;return res;};res.json=data=>{res.setHeader('Content-Type','application/json');res.end(JSON.stringify(data));};
    try{await require('.'+pathname+'.js')(req,res);}catch(_){res.status(500).json({error:'The preview could not complete this request.'});}return;
  }
  let name;try{name=decodeURIComponent(pathname);}catch(_){res.writeHead(400);res.end();return;}
  if(name==='/')name='/learn.html';if(!path.extname(name))name+='.html';
  const file=path.resolve(__dirname,'.'+name);
  if(!file.startsWith(__dirname+path.sep)||!['.html','.js','.svg','.png','.mp3','.txt'].includes(path.extname(file))||file.includes(path.sep+'api'+path.sep)){res.writeHead(404);res.end();return;}
  fs.readFile(file,(err,data)=>{if(err){res.writeHead(404);res.end('Not found');return;}res.setHeader('Content-Type',types[path.extname(file)]);res.end(data);});
}).listen(Number(process.env.PORT)||4176,'127.0.0.1',()=>console.log('TECH mini-course preview ready on localhost:'+(process.env.PORT||4176)+'/learn.html'));
