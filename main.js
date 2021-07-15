var express = require("express");
var app = express();
var bodyParser = require("body-parser"); 
var session = require("express-session");
const path = require('path')
require('ejs')
const fetch = require('node-fetch');
;
const db = require('./db');
const { allowedNodeEnvironmentFlags } = require("process");
const alpha = require('alphavantage')({key:'PYD2OA703Q7C1ZN7'})

app.set('view engine','ejs');
app.set('views',path.join(__dirname,'/.'))
app.use(bodyParser.urlencoded({extended: true}));
app.use(session({secret: 'notagoodsecret'}))

app.get("/",function(req,res){
	res.redirect('login');
});

app.get("/login",function(req,res){
    /*var object = ["BSE:TCS","BSE:RELIANCE","BSE:SBIN","BSE:INFY","BSE:ITC","BSE:ADANIENT","BSE:JSWSTEEL","BSE:DABUR","BSE:TATASTEEL"];*/
  /*  var object = ["BSE:RELIANCE","BSE:SBIN","BSE:ADANIENT","BSE:DABUR","BSE:JSWSTEEL"];*/
     /*   var object = ["BSE:TCS","BSE:TATASTEEL"];
     var object = ["BSE:ONGC","BSE:LTI","BSE:500180(hdfcban)","BSE:HINDUNILVR","BSE:532174(icici)","BSE:507685(wipro),"BSE:500820(asianpaints)","540376(dmart)","524715(sunpharma)","500114(titan)"]*/
    /* var object = ["500114"]
   object.forEach(i => {
        alpha.data.daily(i).then(data => {
            var obj = JSON.parse(JSON.stringify(data))
            
            var lr = obj['Meta Data']['3. Last Refreshed'];
            var value = obj['Time Series (Daily)'][lr]["4. close"]
            var symbol = obj['Meta Data']['2. Symbol']
    
            let stockdata = {Symbol: symbol, Price : value , Updated:lr};
            let sql = 'INSERT INTO stocks SET ?';
            //"INSERT INTO `profiles` (`Name`, `Option`,'','') VALUES ('"+useremail+"','"+ password+"')";
             let query = db.query(sql,stockdata);
            console.log("stocks added");
        });
    })
   /* alpha.data.daily(`BSE:RELIANCE`).then(data => {
        var obj = JSON.parse(JSON.stringify(data))
        
        var lr = obj['Meta Data']['3. Last Refreshed'];
        var value = obj['Time Series (Daily)'][lr]["4. close"]
        var symbol = obj['Meta Data']['2. Symbol']

        let stockdata = {Symbol: symbol, Price : value , Updated:lr};
        let sql = 'INSERT INTO stocks SET ?';
        //"INSERT INTO `profiles` (`Name`, `Option`,'','') VALUES ('"+useremail+"','"+ password+"')";
         let query = db.query(sql,stockdata);
        console.log("stocks added");
        res.redirect('login.html');
    });*/
    
	res.sendFile('demo.html',{ root: __dirname });
});

app.post("/signup",function(req,res){
	var Name = req.body.name;
    var Option = "User";
    var Email = req.body.email;
    var Password = req.body.pass;

    let data = {Name: Name,Option: Option,Email:Email,Password:Password};
    let sql = 'INSERT INTO user SET ?';
    //"INSERT INTO `profiles` (`Name`, `Option`,'','') VALUES ('"+useremail+"','"+ password+"')";
    let query = db.query(sql,data);
    console.log("added");
    res.redirect('demo.html');
});

app.get("/register",function(req,res){
	res.sendFile('Register.html',{ root: __dirname });
});

var activuser;

app.post("/login",function(req,res){
    var email = req.body.mail;
    var password = req.body.pass;
    console.log(req.body);
    let sql= 'SELECT * FROM user WHERE Email = ?';
    let query = db.query(sql,[email], function (err,result){
        if (err) throw err;
       var obj = JSON.parse(JSON.stringify(result))

       
        if( !result || password!=obj[0].Password )
        {
           
            res.send("incorrect")
        }
        else{

            req.session.user_id = obj[0].Email;
            activuser = obj[0].Email;
            if(obj[0].Option=='User')
           { res.redirect("check2");}
           else{
               res.redirect("home2")
           }
        }

        
    });
})
var name;
app.get("/home",function(req,res){
   
    let sql= 'SELECT * FROM user WHERE Email = ?';
    let query = db.query(sql,[activuser], function (err,result){
        if (err) throw err;
       var obj3 = JSON.parse(JSON.stringify(result))

       name=obj3[0].Name;
     
       
       let sql= 'SELECT * FROM stocks WHERE User = ?';
       let query = db.query(sql,[activuser],function (err,result){
           if (err) throw err;
          var obj = JSON.parse(JSON.stringify(result))
        
          let sql = 'SELECT * FROM buy WHERE user = ? LIMIT 3'
          let query = db.query(sql,activuser,function (err,result){
            if (err) throw err;
           var obj2 = JSON.parse(JSON.stringify(result))
           var arr = []
           var dates = []
           fetch('https://www.quandl.com/api/v3/datasets/BSE/SENSEX.json?api_key=cbXfDCTd4xHdottt5sH6')
                .then(res => res.json())
                .then(obj6 => {
                   for(i=0; i<100; i++){
                       arr.push(obj6.dataset.data[i][4])
                       dates.push(obj6.dataset.data[i][0])
                   }
             
                   res.render('home2.ejs',{obj : obj,name : name,obj2 : obj2,arr : arr,dates : dates});
           })
           
           
          
        });
          
         
       });
    });
})

app.get("/stocks",function(req,res){




    let sql= 'SELECT * FROM stocks';
    let query = db.query(sql,function (err,result){
        if (err) throw err;
       var obj = JSON.parse(JSON.stringify(result))

    
       res.render('stocks.ejs',{obj : obj});
      
    });
	
});




app.post("/search",function(req,res){
    var sr = req.body.search;
    fetch('https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords='+sr+'&apikey=PYD2OA703Q7C1ZN7')
    .then(res => res.json())
    .then(obj => {
        var br = obj["bestMatches"];
        var obj = JSON.parse(JSON.stringify(br))
        console.log(obj)
        res.render("search.ejs",{obj:obj,br : br,name: name})
    })
    

})

// name,symbol,current price ,last price,
app.get("/stocks2",function(req,res){


    /*var object2 = ["BSE:MARUTI","BSE:LT","BSE:NESTLEIND"];
     object2.forEach(i => {
        alpha.data.daily(i).then(data => {
            var obj = JSON.parse(JSON.stringify(data))
            
            var lr = obj['Meta Data']['3. Last Refreshed'];
            var value = obj['Time Series (Daily)'][lr]["4. close"]
            var symbol = obj['Meta Data']['2. Symbol']
    
            let stockdata = {Symbol: symbol, Price : value , Updated:lr};
            let sql = 'INSERT INTO stocks SET ?';
            //"INSERT INTO `profiles` (`Name`, `Option`,'','') VALUES ('"+useremail+"','"+ password+"')";
             let query = db.query(sql,stockdata);
            console.log("stocks added");
        });
    })*/

    let sql= 'SELECT * FROM stocks';
    let query = db.query(sql,function (err,result){
        if (err) throw err;
       var obj = JSON.parse(JSON.stringify(result))

    
       res.render('stocks2.ejs',{obj : obj,name:name});
      
    });
	
});

app.get("/refresh",function(req,res) {


/* fetch all with date not refreshed
    refresh 5 at a time
    repeat*/
    
    alpha.data.daily(`BSE:RELIANCE`).then(data => {
        var obj = JSON.parse(JSON.stringify(data))
        
        var lr = obj['Meta Data']['3. Last Refreshed'];
        

        let sql= 'SELECT * FROM stocks LIMIT 4';
        let query = db.query("SELECT Symbol, Price, Updated FROM stocks WHERE Updated <> ? LIMIT 4",[lr],function (err,result){
            if (err) throw err;
            var obj7 = JSON.parse(JSON.stringify(result))
            
            obj7.forEach(i => {
                var lastu = i.Updated;
                var lprice= i.Price;
                alpha.data.daily(i.Symbol).then(data => {
                     var obj8 = JSON.parse(JSON.stringify(data))
                 
                     var lr = obj8['Meta Data']['3. Last Refreshed'];
                  if(lastu != lr)
                  {
                     var value = obj8['Time Series (Daily)'][lr]["4. close"];
                     var symbol = obj8['Meta Data']['2. Symbol'];
                     
                     /*let stockdata = {Price : value , Updated:lr,Symbol : symbol};
                     let sql = 'UPDATE stocks SET ? WHERE Symbol = ?';*/
                     //"INSERT INTO `profiles` (`Name`, `Option`,'','') VALUES ('"+useremail+"','"+ password+"')";
                      let query = db.query("UPDATE stocks SET Price = ? , Updated = ?, last_price = ? WHERE Symbol = ?",[value,lr,lprice,symbol],function (err,result) {
                         if (err) throw err;
                         else console.log(result);
                         });
                     console.log("stocks updated");
                 
                  }
     
                 
                 
             
             
         
                  })
            
            
            })
       

        
        });

    
     res.redirect("/home");
      
    });
})

app.get("/home/stocks/:id",function(req,res){
        var stock = req.params.id;



        alpha.data.daily(stock).then(data => {
        var obj5 = JSON.parse(JSON.stringify(data))
        
        var lr = obj5['Meta Data']['3. Last Refreshed'];
        var value = obj5['Time Series (Daily)'][lr]["4. close"]
        var symbol = obj5['Meta Data']['2. Symbol']

        var dates = []
        var value = []
        var i=0;
        for( var dat in obj5['Time Series (Daily)']){
            //if(i>7){break;}
            dates.push(dat);
            
            value.push(obj5['Time Series (Daily)'][dat]['4. close']);
           // i++;
        }
        
        
        
        db.query('SELECT * FROM stocks WHERE Symbol = ?',[stock],function(err,result){
            if (err) throw err;
            var obj3 = JSON.parse(JSON.stringify(result))
            
            let sql5= 'SELECT * FROM buy WHERE user = ?';
            let query = db.query(sql5,[activuser], function (err,result){
                if (err) throw err;
               var obj4 = JSON.parse(JSON.stringify(result))
               var high = Math.max(value);
               res.render('stockinf2.ejs',{obj: obj5,obj2: obj3,obj3: obj4, dates : dates, value : value, high : high,name:name})
              
            });
        
        })

        

    });

    
})

app.post("/home/stocks/:id/addwish",function(req,res){
    var st = req.body.add;
    var br;
    fetch('https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords='+st+'&apikey=PYD2OA703Q7C1ZN7')
    .then(res => res.json())
    .then(obj => {
        br = obj["bestMatches"][0]['2. name']
    })
    alpha.data.daily(st).then(data => {
    var obj5 = JSON.parse(JSON.stringify(data))
    var symbol = obj5['Meta Data']['2. Symbol'];
    var value = obj5;
    var lr = (obj5['Meta Data']['3. Last Refreshed']);
    var lastp ;

	var value =  obj5['Time Series (Daily)'][lr]["4. close"];    
    var i=0;   
    for( var dat in obj5['Time Series (Daily)']){
        if(i>1){break;}
    
        if(i==1){ lastp = obj5['Time Series (Daily)'][dat]['4. close'];}
        
        i++;
    }
    
    let stockdata = {Name : br ,Symbol: symbol, Price : value , Updated:lr, User: [activuser],last_price : lastp};


    let sql = 'INSERT INTO stocks SET ?';
    let query = db.query(sql,stockdata);
    console.log("stocks added");
    res.redirect("/home")
})
})

app.post("/home/stocks/:id/removewish",function(req,res){
    var st = req.body.add;
    let sql = 'DELETE FROM stocks WHERE Symbol = ?';
    let query = db.query(sql,[st]);
    console.log("stocks deleted");
    res.redirect("/s/"+st)
})

app.get("/s/:id",function(req,res){
    var stock = req.params.id;



    alpha.data.daily(stock).then(data => {
    var obj5 = JSON.parse(JSON.stringify(data))
    
    var lr = obj5['Meta Data']['3. Last Refreshed'];
    var value = obj5['Time Series (Daily)'][lr]["4. close"]
    var symbol = obj5['Meta Data']['2. Symbol']

    var dates = []
    var value = []
    var i=0;
    for( var dat in obj5['Time Series (Daily)']){
        //if(i>7){break;}
        dates.push(dat);
        
        value.push(obj5['Time Series (Daily)'][dat]['4. close']);
       // i++;
    }
    
    
    
    db.query('SELECT * FROM stocks WHERE Symbol = ? AND User = ?',[symbol,activuser],function(err,result){
        if (err) throw err;
        var obj3 = JSON.parse(JSON.stringify(result))
        console.log(obj3);
        console.log(activuser);

        
        let sql5= 'SELECT * FROM buy WHERE user = ?';
        let query = db.query(sql5,[activuser], function (err,result){
            if (err) throw err;
           var obj4 = JSON.parse(JSON.stringify(result))
           var high = Math.max(...value);
           var low = Math.min(...value);
           
           let sql6= 'SELECT * FROM stocks WHERE User = ?';
           let query23 = db.query(sql6,[activuser], function (err,result){
               if (err) throw err;
              var obj6 = JSON.parse(JSON.stringify(result))
              
              
              res.render('stockinf2.ejs',{obj: obj5,obj2: obj3,obj3: obj4,obj4 : obj6, dates : dates, value : value, high : high, low : low,name:name})
             
           });

          
          
        });
    
    })

    

});

    
})

app.get("/home/s/:id",function(req,res){
    var stock = req.params.id;



    alpha.data.daily(stock).then(data => {
    var obj5 = JSON.parse(JSON.stringify(data))
    
    var lr = obj5['Meta Data']['3. Last Refreshed'];
    var value = obj5['Time Series (Daily)'][lr]["4. close"]
    var symbol = obj5['Meta Data']['2. Symbol']

    var dates = []
    var value = []
    var i=0;
    for( var dat in obj5['Time Series (Daily)']){
        //if(i>7){break;}
        dates.push(dat);
        
        value.push(obj5['Time Series (Daily)'][dat]['4. close']);
       // i++;
    }
    
    
    
    db.query('SELECT * FROM stocks WHERE Symbol = ? & User = ?',[stock,activuser],function(err,result){
        if (err) throw err;
        var obj3 = JSON.parse(JSON.stringify(result))
        console.log(obj3);
        
        let sql5= 'SELECT * FROM buy WHERE user = ?';
        let query = db.query(sql5,[activuser], function (err,result){
            if (err) throw err;
           var obj4 = JSON.parse(JSON.stringify(result))
           var high = Math.max(...value);
           var low = Math.min(...value);
           
           let sql6= 'SELECT * FROM stocks WHERE User = ?';
           let query23 = db.query(sql6,[activuser], function (err,result){
               if (err) throw err;
              var obj6 = JSON.parse(JSON.stringify(result))
              
              
              res.render('stockinf2.ejs',{obj: obj5,obj2: obj3,obj3: obj4,obj4 : obj6, dates : dates, value : value, high : high, low : low,name:name})
             
           });

          
          
        });
    
    })

    

});

    
})

app.get("/viewrules",function(req,res){
    let sql= 'SELECT * FROM rulestore WHERE broker=?';
    let query = db.query(sql,[activuser], function (err,result){
        if (err) throw err;
       var obj3 = JSON.parse(JSON.stringify(result))
     
       res.render('rules.ejs',{obj : obj3});
      
    });
})

app.get("/brokers",function(req,res){
    var broker = 'Broker';
    let sql= 'SELECT Name,Email FROM user WHERE Option = ?';
    let query = db.query(sql,[broker], function (err,result){
        if (err) throw err;
       var obj3 = JSON.parse(JSON.stringify(result))
     
       res.render('brokers.ejs',{obj : obj3});
      
    });
})

app.get("/home/brokers/:id",function(req,res){
    var id = req.params.id;
    let sql= 'SELECT Name,Email FROM user WHERE Email = ?';
    let query = db.query(sql,[id], function (err,result){
        if (err) throw err;
       var obj5 = JSON.parse(JSON.stringify(result))
        var email = obj5[0].Email;
       let sql2='SELECT * FROM rulestore WHERE broker = ?';
       let query2=db.query(sql2,[email],function(err,result){
           if (err) throw err;
           var obj6 = JSON.parse(JSON.stringify(result))
        
           res.render('brokerprof.ejs',{obj: obj5,obj2 : obj6});
       })
     
       
      
    });
    
})

app.get("/profile",function(req,res){
    var logged = req.session.user_id;
    var name;
    let sql= 'SELECT * FROM user WHERE Email = ?';
    let query = db.query(sql,[logged], function (err,result){
        if (err) throw err;
       var obj3 = JSON.parse(JSON.stringify(result))

       
     
       res.render('profile.ejs',{obj: obj3,name:name});
      
    });
})

app.get("/setrule",function(req,res){
	res.sendFile('setr.html',{ root: __dirname });
});

app.post("/setr",function(req,res){
	var id = req.body.id;
    var code = req.body.code;
    var type = req.body.bstype;
    var email = req.session.user_id;
    let data = {id:id, code: code,type:type,broker:email};
    let sql = 'INSERT INTO rulestore SET ?';
    //"INSERT INTO `profiles` (`Name`, `Option`,'','') VALUES ('"+useremail+"','"+ password+"')";
    let query = db.query(sql,data);
   
 

});

app.post("/home/stocks/:id/buy1",function(req,res){

    var pr = req.body.add;
    var st = req.params.id;
    res.render("buy1.ejs",{st : st, pr: pr, name: name})

      
    });


app.post("/checkrule",function(req,res){
    let sql = 'SELECT * FROM rules WHERE id=3 ';
    //"INSERT INTO `profiles` (`Name`, `Option`,'','') VALUES ('"+useremail+"','"+ password+"')";
    let query = db.query(sql, function (err,result, fields){
        if (err) throw err;
        //console.log(result.RowDataPacket.Complexity);
        //res.send(JSON.stringify(result));
        var obj = JSON.parse(JSON.stringify(result))
        //console.log(req.body.quantity);
        if(req.body.quantity>=obj[0].quantity && req.body.type==obj[0].type && req.body.complexity==obj[0].complexity && req.body.product==obj[0].product)
        {
            res.send("pass");
        }
        else
        { res.send("fail");
            }
        
    });
    
});


app.get("/query",function(req,res){
	//let sql = 'SELECT * FROM query WHERE id=1 ';
    //let query = db.query(sql, function (err,result, fields){
      //  if (err) throw err;
        //var obj = JSON.parse(JSON.stringify(result))
        //eval(obj[0].code);
    
    //});
    res.sendFile('query.html',{ root: __dirname });
});





app.post("/home/stocks/:id/buy",function(req,res){
    var st = req.params.id;
    var type = req.body.type;
    var quantity = req.body.quantity; 
    var compl = req.body.complexity;
    var sl = req.body.stoploss;
    var limit = req.body.limit;
    var profpoin = req.body.pp;
    /*if(profpoin == null){ profpoin=0; }
    if(limit == null){ limit=0;}
    if(sl = null){sl =  0;}*/
    
   
    alpha.data.daily(st).then(data => {
        var obj5 = JSON.parse(JSON.stringify(data))
        var lr = (obj5['Meta Data']['3. Last Refreshed']);
        var status;
        var pr =  obj5['Time Series (Daily)'][lr]["4. close"];    
        var val = pr * quantity;
        let query = db.query('SELECT balance FROM user WHERE Email=?',[activuser], function(err,result){
            if (err) throw err;
          var obj3 = JSON.parse(JSON.stringify(result))
            var balance = obj3[0].balance;
          if(balance < val )
          {
            
            status = "rejected";
            let stockdata = {stock_symbol : st, user : req.session.user_id , quantity : quantity, stock_price : pr, value: val , complexity:compl,type : type, bdate : lr, stoploss : sl,limit_ : limit,profit_point:profpoin,status: status};
           
    
            let sql = 'INSERT INTO buy SET ?';
            let query = db.query(sql,stockdata);
            res.redirect("/home");
          }
          else if(type == 'limit' || type== 'sl limit'){
            status = 'pending';
            let stockdata = {stock_symbol : st, user : req.session.user_id , quantity : quantity, stock_price : pr, value: val , complexity:compl,type : type, bdate : lr, stoploss : sl,limit_ : limit,status: status};
           
    
            let sql = 'INSERT INTO buy SET ?';
            let query = db.query(sql,stockdata);
            console.log("stocks bought");
            res.redirect("/home")
          }
          else{
            status = 'completed';
            let stockdata = {stock_symbol : st, user : req.session.user_id , quantity : quantity, stock_price : pr, value: val , complexity:compl,type : type, bdate : lr, stoploss : sl,limit_ : limit,status: status};
            balance = balance - val;
    
            let sql = 'INSERT INTO buy SET ?';
            let query = db.query(sql,stockdata);
            console.log("stocks bought");
            let query2 = db.query("UPDATE user SET balance = ? WHERE Email = ?",[balance,activuser])
            res.redirect("/home")
          }
        })


    })


 
});

app.get("/home2",function(req,res){

    
    let sql5= 'SELECT * FROM stocks';
    let query = db.query(sql5,[activuser], function (err,result){
        if (err) throw err;
       var obj3 = JSON.parse(JSON.stringify(result))
     
       
       
       let sql = 'SELECT * FROM buy WHERE user = ? LIMIT 3'
       let query = db.query(sql,activuser,function (err,result){
         if (err) throw err;
        var obj2 = JSON.parse(JSON.stringify(result))
      
      
        res.render('home2.ejs',{obj3 : obj3 ,obj2 : obj2, name : activuser});

    
    
})
    })
})


app.get("/check2",function(req,res){
    alpha.data.daily(`BSE:RELIANCE`).then(data => {
        var obj2 = JSON.parse(JSON.stringify(data))
        var lr = (obj2['Meta Data']['3. Last Refreshed']);
        let query = db.query("SELECT * FROM buy WHERE user = ? AND last_checked <> ? AND limit_ <>0 AND stoploss <>0 AND profit_point <>0 LIMIT 2",[activuser,lr] ,function (err,result){
            if (err) throw err;
           var obj3 = JSON.parse(JSON.stringify(result));
           obj3.forEach(i => {
               //limit
                var st = i.stock_symbol;
                var od = i.order_number;
               if(i.status == "pending"){
               
                 alpha.data.daily(st).then(data => {
                var obj = JSON.parse(JSON.stringify(data))
                var lr = (obj['Meta Data']['3. Last Refreshed']);
                var pr = obj['Time Series (Daily)'][lr]["4. close"];

                if(pr<= i.limit_){
                    let sql6= 'SELECT * FROM user WHERE Email = ?';
                    let query2 = db.query(sql6,[activuser], function (err,result){

                        if (err) throw err;
                       var obj6 = JSON.parse(JSON.stringify(result))
                     var balance = obj6[0].balance;
                      if(pr<balance){
                        var status = "rejected";
                        
                        
                        let query3 = db.query('UPDATE buy SET status = ? WHERE order_number = ?',[status,od]);
                      }
                      else
                      {
                        status = 'completed';
                        balance = balance - val;
                
                        
                        let query4 = db.query('UPDATE buy SET status = ? WHERE order_number = ?',[status,od]);
                        console.log("stocks bought");
                        let query5 = db.query("UPDATE user SET balance = ? WHERE Email = ?",[balance,activuser])
                      }
                    });
                    
                }
              
                 });
               }
               else if (i.stoploss != "NULL")
               {
                var quantity = i.quantity;
                var st = i.stock_symbol;
                alpha.data.daily(i.stock_symbol).then(data => {
                    var obj = JSON.parse(JSON.stringify(data))
                    var lr = (obj['Meta Data']['3. Last Refreshed']);
                    var pr = obj['Time Series (Daily)'][lr]["4. close"];
    
                    if(pr<i.stoploss)
                    {   var odr=obj3[i].order_number;
                        let query = db.query("DELETE FROM buy WHERE order_number = ?",[odr], function(err,result){
                            if (err) throw err;
                            let query4 = db.query('SELECT * FROM user WHERE Email = ?',[activuser],function(err,result){
                                if (err) throw err;
                                var obj5 = JSON.parse(JSON.stringify(result));
                                //alpa
                                    var val = quantity * pr;
                                    var bal = obj5[0].balance;
                                    bal = bal + val;
                                    let query9 = db.query("UPDATE user SET balance = ? WHERE Email = ?",[bal,activuser])
                                    let data3 = {order_number: odr , stock_symbol : st ,quantity : quantity , price : pr , sell_date : lr, user : activuser};
                                    let sql69 = 'INSERT INTO history SET ?';
                                    let query11 = db.query(sql69,data3);
                                    console.log(odr+"deleted");
                                    res.redirect("/home");
                            
                            })
                            
                        })
                    }
                    
            });
               }
               else if(pr >= i.profit_point ){
                var odr=obj3[i].order_number;
                let query6 = db.query("DELETE FROM buy WHERE order_number = ?",[odr], function(err,result){
                    if (err) throw err;
                    let query7 = db.query('SELECT * FROM user WHERE Email = ?',[activuser],function(err,result){
                        if (err) throw err;
                        var obj58 = JSON.parse(JSON.stringify(result));
                        //alpa
                            var val = quantity * pr;
                            var bal = obj58[0].balance;
                            bal = bal + val;
                            let query11 = db.query("UPDATE user SET balance = ? WHERE Email = ?",[bal,activuser])
                            console.log(odr+"deleted");
                            res.redirect("/home");
                    
                    })
                    
                
        
            
    });
               }
               let query55 = db.query('UPDATE buy SET last_checked = ? WHERE order_number = ?',[lr,od]);
           

           
        }) 
           res.redirect("home")
    })
})
})



app.get("/limit", function(req,res){
   // SELECT * FROM buy WHERE user = 'tjs@gmail.com' AND limit_ IS NOT NULL
    let sql5= 'SELECT * FROM buy WHERE user = ?';
    let query = db.query(sql5,[activuser], function (err,result){
        if (err) throw err;
       var obj3 = JSON.parse(JSON.stringify(result))
     
        obj3.forEach(i => {
            var st = i.stock_symbol;
            var od = i.order_number;
            alpha.data.daily(st).then(data => {
                var obj = JSON.parse(JSON.stringify(data))
                var lr = (obj['Meta Data']['3. Last Refreshed']);
                var pr = obj['Time Series (Daily)'][lr]["4. close"];

                if(pr<= i.limit_){
                    let sql6= 'SELECT * FROM user WHERE Email = ?';
                    let query2 = db.query(sql6,[activuser], function (err,result){

                        if (err) throw err;
                       var obj6 = JSON.parse(JSON.stringify(result))
                     var balance = obj6[0].balance;
                      if(pr<balance){
                        var status = "rejected";
                        
                        
                        let query3 = db.query('UPDATE buy SET status = ? WHERE order_number = ?',[status,od]);
                      }
                      else
                      {
                        status = 'completed';
                        balance = balance - val;
                
                        
                        let query4 = db.query('UPDATE buy SET status = ? WHERE order_number = ?',[status,od]);
                        console.log("stocks bought");
                        let query5 = db.query("UPDATE user SET balance = ? WHERE Email = ?",[balance,activuser])
                      }
                    });
                    
                }
              res.redirect("home");  
        });
        })
      
    });



})

app.get("/myorders",function(req,res){


    let sql5= 'SELECT * FROM buy WHERE user = ?';
    let query = db.query(sql5,[activuser], function (err,result){
        if (err) throw err;
       var obj3 = JSON.parse(JSON.stringify(result))
     
       res.render('orders.ejs',{obj3: obj3, name: name});
      
    });

})

app.get("/history",function(req,res){
    let sql5= 'SELECT * FROM history WHERE user = ?';
    let query = db.query(sql5,[activuser], function (err,result){
        if (err) throw err;
       var obj3 = JSON.parse(JSON.stringify(result))
     
       res.render('history.ejs',{obj3: obj3,name:name});
      
    });
})


app.post("/myorders/:id/sell", function (req,res){
        var st = req.params.id;
        var on = req.body.no;
        var quantity = req.body.quantity;
        let sql6= 'SELECT * FROM buy WHERE order_number = ?';
        let query = db.query(sql6,[on], function (err,result){
            if (err) throw err;
            var obj3 = JSON.parse(JSON.stringify(result))
            console.log(quantity);
            console.log(obj3[0].quantity);
            if(quantity == obj3[0].quantity)
            { let query3 = db.query('DELETE FROM buy WHERE order_number = ?',[on])
                let query4 = db.query('SELECT * FROM user WHERE Email = ?',[activuser],function(err,result){
                    if (err) throw err;
                    var obj5 = JSON.parse(JSON.stringify(result));
                    //alpa
                    alpha.data.daily(st).then(data => {
                        var obj = JSON.parse(JSON.stringify(data))
                        var lr = (obj['Meta Data']['3. Last Refreshed']);
                        var pr = obj['Time Series (Daily)'][lr]["4. close"];
        
                        var val = quantity * pr;
                        var bal = obj5[0].balance;
                        bal = bal + val;
                        let query9 = db.query("UPDATE user SET balance = ? WHERE Email = ?",[bal,activuser])
                        let data3 = {order_number: on , stock_symbol : st ,quantity : quantity , price : pr , sell_date : lr, user : activuser};
                        let sql69 = 'INSERT INTO history SET ?';
                        let query10 = db.query(sql69,data3);
                        res.redirect("/myorders");
                });
                })
            }
            else if (quantity < obj3[0].quantity)
            {
                var quantity2 = quantity;
                console.log(obj3[0].quantity)
                quantity = obj3[0].quantity - quantity;
                let query3 = db.query('UPDATE buy SET quantity = ? WHERE order_number = ?',[quantity,on])
                let query4 = db.query('SELECT * FROM user WHERE Email = ?',[activuser],function(err,result){
                    if (err) throw err;
                    var obj5 = JSON.parse(JSON.stringify(result));
                    //alpa
                    alpha.data.daily(st).then(data => {
                        var obj = JSON.parse(JSON.stringify(data))
                        var lr = (obj['Meta Data']['3. Last Refreshed']);
                        var pr = obj['Time Series (Daily)'][lr]["4. close"];
        
                        var val = quantity2 * pr;
                        var bal = obj5[0].balance;
                        bal = bal + val;
                        let query9 = db.query("UPDATE user SET balance = ? WHERE Email = ?",[bal,activuser])
                        let data3 = {order_number: on , stock_symbol : st ,quantity : quantity , price : pr , sell_date : lr, user : activuser};
                        let sql69 = 'INSERT INTO history SET ?';
                        let query10 = db.query(sql69,data3);
                        res.redirect("/myorders");
                });
                })
                //pending
            }
         
          
        }); 
})

app.post("/logout",function(req,res){
    console.log('lofour');
	req.session.user_id = null;
    res.redirect('login');
 

});

app.get("/alpha",function(req,res){
   /* alpha.data.intraday(`RELIANCE.BSE`).then(data => {
        res.send(data);
      });*/
      let sql = 'SELECT * FROM query WHERE id=1 ';
    let query = db.query(sql, function (err,result, fields){
        if (err) throw err;
        var obj = JSON.parse(JSON.stringify(result))
        console.log(obj);
    
    });

})

app.get("/addstock",function(req,res){
    res.render('addstock.ejs');
})

app.post("/addstock",function(req,res){

})

app.listen(process.env.PORT || 3000,() => {
	console.log("server started");
})