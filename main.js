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

//전체 연락처 조회
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

//특정 연락처 상세정보 조회
app.get('/page/:pageId', function(request, response) { 
  fs.readdir('./data', function(error, filelist){
    var filteredId = path.parse(request.params.pageId).base;
    fs.readFile(`data/${filteredId}`, 'utf8', function(err, description){
      var title = request.params.pageId;
      var array = fs.readFileSync(`data/${filteredId}`).toString().split("\n");
      var email = array[0];
      var phone = array[1];
      var sanitizedTitle = sanitizeHtml(title);
      var sanitizedEmail = sanitizeHtml(email);
      var sanitizedPhone = sanitizeHtml(phone);
      var list = template.list(filelist);
      var html = template.HTML(sanitizedTitle, list='',
        `<h1>Show</h1>
        <h2>${sanitizedTitle}</h2>
        <pre>Email      ${sanitizedEmail}</pre>
        <pre>Phone      ${sanitizedPhone}</pre>`,
        `<form action="/contacts/:pageId" method="post">
        <input type="hidden" name="id" value="${sanitizedTitle}">
        <button type="button" onclick="location.href='/contacts/${sanitizedTitle}/edit';">update</button>
        <input type="submit" value="delete"></form>
        `
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
    var html = template.HTML(title, list='', `
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
app.get('/contacts/:pageId/edit', function(request, response){
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
        <form action="/contacts/:pageId" method="post">
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
        `, ''
      );
      response.send(html);
    });
  });
});

//특정 연락처 정보 수정
app.post('/contacts/:pageId', function(request, response){
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

//연락처 삭제
app.post('/contacts/:pageId', function(request, response){
  var body = '';
  request.on('data', function(data){
      body = body + data;
  });
  request.on('end', function(){
      var post = qs.parse(body);
      var id = post.id;
      var filteredId = path.parse(id).base;
      fs.unlink(`data/${filteredId}`, function(error){
        response.redirect('/contacts');
      })
  });
});

app.listen(3000, function() {
  console.log('Example app listening on port 3000!')
});