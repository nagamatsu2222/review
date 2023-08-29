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
// 課題05 - レビューの新規追加機能
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
// 課題06 - レビューの更新機能
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

// EX課題01 - 評価値のソート機能
// ソートを選択された場合の処理
app.get("/:order", (req, res) => {
  console.log(req.params.order)
  let sql = "";
  // 標準の場合は全てのユーザー情報を返す
  if (req.params.order === "base") sql = "SELECT * FROM personas";
  // 順番が選択されている場合は昇順か降順か指定する
  else sql = "SELECT * FROM personas ORDER BY rating "+ req.params.order;
  con.query(sql, function (err, result, fields) {
      if (err) throw err;
      // ソートされたユーザー情報と順番の情報を返す
      res.render("index", {
        personasOrg: personasOrg,
        filteredPersonas: result,
        order: order
    });
  });
});


app.listen(port, () => console.log(`Example app listening on port ${port}!`));