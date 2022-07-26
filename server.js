const fs = require("fs");
const http = require("http");
const url = require("url");
const qs = require("qs");
const checkType_login = require("./views/login/js/FileController/check_Login_Filetype");
const checkRegister = require("./views/login/js/FileController/signup");

const Connection = require("./js_connect/configToMySQL");

let connection = Connection.createConnection({ multipleStatements: true });
let home = false;
let login = false;
let signup = false;
let admin = false;
let user = false;
function getCate() {
  return new Promise((resolve, reject) => {
    let queryListCategories = `select name from categories
    order by id;`;
    connection.query(queryListCategories, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}
function LoginControl(req, res) {
  let data = "";
  req.on("data", (chunk) => (data += chunk));
  req.on("end", () => {
    let logindata = qs.parse(data);
    let stringUserName = logindata.username.toString();
    let userquery = `select * from users where username = '${stringUserName}' and password = '${logindata.password}';`;

    connection.query(userquery, (err, data) => {
      if (err) {
        console.log(err);
      } else {
        let parseData = qs.parse(data[0]);
        // console.log(parseData);
        if (parseData.username == null) {
          fs.readFile("./views/login/login.html", "utf-8", (err, data) => {
            if (err) {
              console.log(err);
            } else {
              res.writeHead(200, { "Content-Type": "text/html" });

              let text = `<p style="text-align: center; color: white; font-size: 30px">Tài khoản không tồn tại hoặc nhập sai mật khẩu</p>`;
              data = data.replace("{here}", text);
              res.write(data);
              return res.end();
            }
          });
        } else {
          let rolequery = `select ur.role_id from users u join userrole ur on u.id = ur.user_id where username = '${stringUserName}' and password = '${logindata.password}';`;
          connection.query(rolequery, (err, data) => {
            console.log(parseData);
            if (err) {
              console.log(err);
            } else {
              // ========================================================
              // Set quyền cho tài khoản ...............
              let roleData = qs.parse(data[0]);
              console.log(roleData);
              let role = roleData.role_id;
              if (role === 1) {
                console.log("Tài khoản Admin");
                home = false;
                login = false;
                signup = false;
                admin = true;
                user = false;
                fs.readFile("./views/home/admin.html", "utf-8", (err, data) => {
                  if (err) {
                    console.log(err);
                  } else {
                    res.writeHead(200, { "Content-Type": "text/html" });
                    res.write(data);
                    return res.end();
                  }
                });
              } else if (role === 2) {
                console.log("Tài khoản User");
                home = false;
                login = false;
                signup = false;
                admin = false;
                user = true;
                fs.readFile("./views/home/user.html", "utf-8", (err, data) => {
                  if (err) {
                    console.log(err);
                  } else {
                    res.writeHead(200, { "Content-Type": "text/html" });
                    res.write(data);
                    return res.end();
                  }
                });
              }
            }
          });
          // ========================================================
        }
      }
    });
  });
}

const server = http.createServer((req, res) => {
  //Kiểm tra định dạng tệp req client của login & signup gửi lên server

  //filePath control
  let urlParse = url.parse(req.url);
  let pathName = urlParse.pathname;
  switch (pathName) {
    case "/": {
      home = true;
      login = false;
      signup = false;
      fs.readFile("./views/home/index.html", "utf-8", async (err, data) => {
        if (err) {
          console.log(err);
        } else {
          let categories = await getCate();
          let cateText = "";
          for (let i = 0; i < categories.length; i++) {
            
            cateText += `<li data-filter=".oranges">${categories[i].name}</li>`;
          }
          data = data.replace("{catelogies}", cateText);
          res.writeHead(200, { "Content-Type": "text/html" });
          res.write(data);
          return res.end();
        }
      });
      break;
    }
    // case "/signup": {
    //   if (req.method === "GET") {
    //     fs.readFile(
    //       "./views/login/SignUpAccount.html",
    //       "utf-8",
    //       (err, data) => {
    //         if (err) {
    //           console.log(err);
    //         } else {
    //           res.writeHead(200, { "Content-Type": "text/html" });
    //           res.write(data);
    //           return res.end();
    //         }
    //       }
    //     );
    //   } else {
    //     checkRegister(req, res);
    //   }
    //   break;
    // }
    case "/login": {
      home = false;
      login = true;
      signup = false;
      //Data control login site
      if (req.method === "GET") {
        fs.readFile("./views/login/login.html", "utf-8", (err, data) => {
          if (err) {
            console.log(err);
          } else {
            res.writeHead(200, { "Content-Type": "text/html" });
            res.write(data);
            return res.end();
          }
        });
      } else {
        LoginControl(req, res);
      }
      break;
    }
    case "/signup": {
      home = false;
      login = false;
      signup = true;
      if (req.method === "GET") {
        fs.readFile(
          "./views/login/SignUpAccount.html",
          "utf-8",
          (err, data) => {
            if (err) {
              console.log(err);
            } else {
              res.writeHead(200, { "Content-Type": "text/html" });
              res.write(data);
              return res.end();
            }
          }
        );
      } else {
        checkRegister.SignUpAccount(req, res);
      }
      break;
    }
    // default: {
    //   fs.readFile("./views/404-error.html", "utf-8", (err, data) => {
    //     if (err) {
    //       console.log(err);
    //     } else {
    //       res.writeHead(200, { "Content-Type": "text/html" });
    //       res.write(data);
    //       return res.end();
    //     }
    //   });
    // }
  }
  if (home === true) {
    let path = "./views/home";
    checkType_login(req, res, path);
  }
  if (login === true) {
    let path = "./views/login";
    checkType_login(req, res, path);
  }
  if (signup === true) {
    let path = "./views/login";
    checkType_login(req, res, path);
  }
  if (user === true) {
    let path = "./views/home";
    checkType_login(req, res, path);
  }
});

server.listen(8080, () => {
  console.log("Server is running on http://localhost:8080");
});
