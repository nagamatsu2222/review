const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({
  extended: true
}));
app.set('view engine', 'ejs');

const mysql = require('mysql2');

const con = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'questionnaire'
});

// cssファイルの取得
app.use(express.static('assets'));

// mysqlからデータを持ってくる
app.get('/', (req, res) => {
  const sql = "select * from personas";
  con.query(sql, function (err, result, fields) {
    if (err) throw err;
    res.render('index', {
      users: result
    });
  });
});
// DBにテーブルを追加する文
app.post('/post', (req, res) => {
  const sql = "INSERT INTO personas SET ?"
  con.query(sql, req.body, function (err, result, fields) {
    console.log(req.body)
    if (err) throw err;
    console.log(result);
    res.redirect('/');
  });
});
// DBを更新する場合update文が必要
app.post('/update/:id', (req, res) => {
  const sql = "UPDATE personas SET ? WHERE id = " + req.params.id;
  con.query(sql,req.body, function (err, result, fields) {
    if (err) throw err;
    console.log(result);
    res.redirect('/');
  });
});
// データ検索
app.get('/edit/:id', (req, res) => {
  const sql = "SELECT * FROM personas WHERE id = ?";
  con.query(sql, [req.params.id], function (err, result, fields) {
    if (err) throw err;
    res.render('edit', {user: result});
  });
});



app.listen(port, () => console.log(`Example app listening on port ${port}!`));