var express = require('express')
var app = express()
var fs = require('fs');
var path = require('path');
var qs = require('querystring');
var sanitizeHtml = require('sanitize-html');
var template = require('./lib/template.js');

app.get('/', function(request, response) { 
  fs.readdir('./data', function(error, filelist){
    var title = '';
    var description = '';
    var list = template.list(filelist);
    var html = template.HTML(title, list,
      `<h2>${title}</h2>${description}`,
      ``
    ); 
    response.send(html);
  });
});

app.get('/contacts', function(request, response) { 
  fs.readdir('./data', function(error, filelist){
    var title = '';
    var description = '';
    var list = template.list(filelist);
    var html = template.HTML(title, list,
      `<h2>${title}</h2>${description}`,
      ``
    ); 
    response.send(html);
  });
});

app.get('/page/:pageId', function(request, response) { 
  fs.readdir('./data', function(error, filelist){
    var filteredId = path.parse(request.params.pageId).base;
    fs.readFile(`data/${filteredId}`, 'utf8', function(err, description){
      var title = request.params.pageId;
      var sanitizedTitle = sanitizeHtml(title);
      var sanitizedDescription = sanitizeHtml(description, {
        allowedTags:['h1']
      });
      var list = template.list(filelist);
      var html = template.HTML(sanitizedTitle, list,
        `<h2>${sanitizedTitle}</h2>${sanitizedDescription}`,
        ` <a href="/contacts">create</a>
          <a href="/contacts/${sanitizedTitle}">update</a>
          <form action="/delete_process" method="post">
            <input type="hidden" name="id" value="${sanitizedTitle}">
            <input type="submit" value="delete">
          </form>`
      );
      response.send(html);
    });
  });
});

//신규 연락처 생성 폼 조회
app.get('/contacts/new', function(request, response){
  fs.readdir('./data', function(error, filelist){
    var title = 'KOSS';
    var list = template.list(filelist);
    var html = template.HTML(title, list, `
      <form action="/contacts" method="post">
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
    `, '');
    response.send(html);
  });
});

//신규 연락처 생성
app.post('/contacts', function(request, response){
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
});

//특정 연락처 수정 폼 제공
app.get('/contacts/:pageId', function(request, response){
  fs.readdir('./data', function(error, filelist){
    var filteredId = path.parse(request.params.pageId).base;
    fs.readFile(`data/${filteredId}`, 'utf8', function(err, description){
      var title = request.params.pageId;
      var list = template.list(filelist);
      var array = description.toString().split("\n");
      var email = array[0];
      var phone = array[1];
      var html = template.HTML(title, list,
        `
        <form action="/update_process" method="post">
          <input type="hidden" name="id" value="${title}">
          <h1>Edit</h1>
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
      response.send(html);
    });
  });
});

app.post('/update_process', function(request, response){
  var body = '';
  request.on('data', function(data){
      body = body + data;
  });
  request.on('end', function(){
      var post = qs.parse(body);
      var id = post.id;
      var title = post.title;
      var name = post.name;
      var email = post.email;
      var phone = post.phone;
      fs.rename(`data/${id}`, `data/${title}`, function(error){
        fs.writeFile(`data/${name}`, `${email}\n${phone}`, 'utf8', function(err){
          // response.writeHead(302, {Location: encodeURI(`/?id=${name}`)});
          // response.end();
          response.redirect(`/?id=${title}`);
        })
      });
  });
});

app.post('/delete_process', function(request, response){
  var body = '';
  request.on('data', function(data){
      body = body + data;
  });
  request.on('end', function(){
      var post = qs.parse(body);
      var id = post.id;
      var filteredId = path.parse(id).base;
      fs.unlink(`data/${filteredId}`, function(error){
        response.redirect('/');
      })
  });
});

app.listen(3000, function() {
  console.log('Example app listening on port 3000!')
});