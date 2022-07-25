const fs = require("fs");
const http = require("http");
const url = require("url");
const qs = require("qs");
const checkType_login = require('./views/login/js/FileController/check_Login_Filetype');
const checkRegister = require('./views/login/js/FileController/signup');
const  Connection  = require("./js_connect/configToMySQL");

let connection = Connection.createConnection({multipleStatements: true});
let home = false;
let login = false;
let signup = false;

const server = http.createServer((req, res) => {
  //Kiểm tra định dạng tệp req client của login & signup gửi lên server
  
  //filePath control
  let urlParse = url.parse(req.url);
  console.log(req.url)
  let pathName = urlParse.pathname;
  switch (pathName) {
    case "/": {
      home = true;
      login = false;
      signup = false;
      fs.readFile("./views/home/index.html", "utf-8", (err, data) => {
        if (err) {
          console.log(err);
        } else {
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
        let data = "";
        req.on("data", (chunk) => (data += chunk));
        req.on("end", () => {
          let logindata = qs.parse(data);
          console.log("da vao phan login");
          console.log(logindata);
          let stringUserName = logindata.username.toString().toLowerCase();
          let userquery1 = `call checkLogin('${stringUserName}', '${logindata.password}', @result);`;
          let userquery2 = `select @result;`;
          connection.query(userquery1, userquery2, (err, data) => {
            if (err) {
              console.log(err);
            } else {
              let parseData = qs.parse(data);
              console.log(parseData);
              if (parseData.username == null) {
                fs.readFile(
                  "./views/login/login.html",
                  "utf-8",
                  (err, data) => {
                    if (err) {
                      console.log(err);
                    } else {
                      res.writeHead(200, { "Content-Type": "text/html" });
                      res.write(data);
                      res.write(
                        "Tài khoản không tồn tại hoặc nhập sai mật khẩu"
                      );
                      return res.end();
                    }
                  }
                );
              } else {
                fs.readFile(
                  "./views/login/loginsuccess.html",
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
              }
            }
          });
        });
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
    checkType_login(req,res,path);
  }
  if (login === true) {
    let path = "./views/login";
    checkType_login(req,res,path);
  }
  if (signup === true) {
    let path = "./views/login";
    checkType_login(req,res,path);
  }

}


);

server.listen(8080, () => {
  console.log("Server is running on http://localhost:8080");
});






