module.exports = {
    HTML:function(title, list, body, control){
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
    },list:function(filelist){
      var list = '<ul>';
      var i = 0;
      while(i < filelist.length){
        list = list + `<li><a href="/page/${filelist[i]}">${filelist[i]}</a></li>`;
        i = i + 1;
      }
      list = list+'</ul>';
      return list;
    }
  }