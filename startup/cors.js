
module.exports = (app) => {
    app.use(function (req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE, OPTIONS");
        res.header(
          "Access-Control-Allow-Headers",
          "Content-Type, Authorization, Content-Length, X-Requested-With, x-auth-token"
        );
      
        //intercepts OPTIONS method
        if ("OPTIONS" === req.method) {
          //respond with 200
          res.sendStatus(200);
        } else {
          //move on
          next();
        }
      });
}