const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const app = express();
const port = 3100;

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
// favicon.icoがリクエストされた場合、空のレスポンスを返す。
app.get("/favicon.ico", (req, res) => {res.status(204);})

// mysqlからデータを持ってくる
app.get('/', (req, res) => {
  const sql = "select * from personas";
  con.query(sql, function (err, result, fields) {
    if (err) throw err;
    res.render('index', {
      users: result,
      order: ""
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


// ソート、絞り込みを選択された場合の処理
app.get("/:filter", (req, res) => {

  let order = ""
  let search = ""
  let orderQuery = ""
  let searchQuery = ""
  let personasOrg = []
  const filter = req.params.filter.split("+")

  // ソート、絞り込みの選択肢が格納されている分だけ処理繰り返し
  filter.forEach((elem) => {
      if (elem.indexOf("order") > -1) {
          // 「order=rating:asc」という形から=の後の記述のみ取得する
          const selectOrder = elem.slice(elem.indexOf("=") + 1)
          if (elem.indexOf("rating") > -1) {
              // 「asc」という形のみ取得する。
              order = selectOrder.slice(selectOrder.indexOf(":") + 1)
              if (order !== "base") orderQuery = `ORDER BY rating ${order}`
          }
          else if (selectOrder === "base") order = "base"
      } else if (elem.indexOf("search") > -1) {
          // 「search=rating:1」という形から=の後の記述のみ取得する
          const selectSearch = elem.slice(elem.indexOf("=") + 1)
          if (elem.indexOf("rating") > -1) {
              // 「1」という形のみ取得する。
              search = selectSearch.slice(selectSearch.indexOf(":") + 1)
              if (search !== "base") searchQuery = `WHERE rating = ${search}`
          }
          else if (selectSearch === "base") search = "base"
      }
  });
  // 検索結果を反映した情報を取得
  sql = `SELECT * FROM personas ${searchQuery} ${orderQuery}`;
  con.query(sql, function (err, result, fields) {
      if (err) throw err;
      // ソートされたユーザー情報と順番,絞り込みの情報を返す
      res.render("index", {
          personasOrg: personasOrg,
          filteredPersonas: result,
          order: order,
          search: search
      });
  });
});


app.listen(port, () => console.log(`Example app listening on port ${port}!`));