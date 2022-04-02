var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');
 
function templateHTML(title, list, body, control){
  return `
  <!doctype html>
  <html>
  <head>
    <title>KOSS</title>
    <meta charset="utf-8">
  </head>
  <body>
    <h2>
    <a href="/contacts">Contact Book</a>
    <a href='/contacts'>Index</a> 
    <a href='/contacts/new'>New</a></h2>
    ${list}
    ${control}
    ${body}
  </body>
  </html>
  `;
}
function templateList(filelist){
  var list = '<ul>';
  var i = 0;
  while(i < filelist.length){
    list = list + `<li><a href="/?id=${filelist[i]}">${filelist[i]}</a></li>`;
    i = i + 1;
  }
  list = list+'</ul>';
  return list;
}
 
var app = http.createServer(function(request,response){
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    var pathname = url.parse(_url, true).pathname;
    if(pathname === '/'){
      if(queryData.id === undefined){
        fs.readdir('./data', function(error, filelist){
          var title = '';
          var description = '';
          var list = templateList(filelist);
          var template = templateHTML(title, list, 
            `<h2>${title}</h2>${description}`,
            `<a href="/contacts">create</a>`);
          response.writeHead(200);
          response.end(template);
        });
      } else {
        fs.readdir('./data', function(error, filelist){
          fs.readFile(`data/${queryData.id}`, 'utf8', function(err, description){
            var title = queryData.id;
            var list = templateList(filelist);
            var template = templateHTML(title, list, 
              `<h2>${title}</h2>${description}`,
              `<a href="/contacts">create</a> 
               <a href="/update?id=${title}">update</a>
               <form action="delete_process" method="post">
                  <input type="hidden" name="id" value="${title}">
                  <input type="submit" value="delete">
                </form>`);
            response.writeHead(200);
            response.end(template);
          });
        });
      }
    } else if(pathname === '/contacts'){
      fs.readdir('./data', function(error, filelist){
        var title = 'KOSS';
        var template = templateHTML(title, list="", `
        <form action="/create_process" method="post">
          <h1>New</h1>
          <p>Name</p>
          <p><input type="text" name="name" placeholder="name"></p>
          <p>Email</p>
          <p><input type="text" name="email" placeholder="email"></p>
          <p>Phone</p>
          <p><input type="text" name="phone" placeholder="phone"></p>
            <p>
              <input type="submit">
            </p>
      </form>
        `,'');
        response.writeHead(200);
        response.end(template);
      });
    }else if(pathname === '/create_process'){
      var body = '';
      request.on('data', function(data){
          body = body + data;
      });
      request.on('end', function(){
          var post = qs.parse(body);
          var name = post.name;
          var email = post.email;
          var phone = post.phone;
          fs.writeFile(`data/${name}`, `${email}\n${phone}`, 'utf8', function(err){
            response.writeHead(302, {Location: encodeURI(`/?id=${name}`)});
            response.end();
          })
      });
    } else if(pathname === '/update'){
      fs.readdir('./data', function(error, filelist){
        fs.readFile(`data/${queryData.id}`, 'utf8', function(err, description){
          var title = queryData.id;
          var list = templateList(filelist);
          var array = description.toString().split("\n");
          var email = array[0];
          var phone = array[1];
          var template = templateHTML(title, list, `
            <form action="/update_process" method="post">
              <input type="hidden" name="id" value="${title}">
              <h1>New</h1>
              <p>Name</p>
              <p><input type="text" name="name" placeholder="name" value="${title}"></p>
              <p>Email</p>
              <p><input type="text" name="email" placeholder="email" value="${email}"></p>
              <p>Phone</p>
              <p><input type="text" name="phone" placeholder="phone" value="${phone}"></p>
              <p>
                <input type="submit">
              </p>
            </form>
            `,
            `<a href="/create">create</a> <a href="/update?id=${title}">update</a>`
          );
          response.writeHead(200);
          response.end(template);
        });
      });
    } else if(pathname === '/update_process'){
        var body = '';
        request.on('data', function(data){
            body = body + data;
        });
        request.on('end', function(){
            var post = qs.parse(body);
            var title = post.title;
            var name = post.name;
            var email = post.email;
            var phone = post.phone;
            var id = post.id;
            fs.rename(`data/${id}`, `data/${title}`, function(error){
                fs.writeFile(`data/${name}`, `${email}\n${phone}`, 'utf8', function(err){
                    response.writeHead(302, {Location: encodeURI(`/?id=${name}`)});
                    response.end();
              })
            });
        });
    } else if(pathname === '/delete_process'){
        var body = '';
        request.on('data', function(data){
            body = body + data;
        });
        request.on('end', function(){
            var post = qs.parse(body);
            var id = post.id;
            fs.unlink(`data/${id}`, function(error){
              response.writeHead(302, {Location: `/`});
              response.end();
            })
        });
    } else {
      response.writeHead(404);
      response.end('Not found');
    }
 
 
 
});
app.listen(3000);