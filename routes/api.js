const express = require('express');
const router=express.Router();
const fs = require('fs');
const client = require('../connection.js')
client.connect();

const multer=require('multer');
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'C:/Users/Flash/Downloads/kenfeduploads')
    },
    filename:(req,file,cb)=>{
        cb(null, req.params.id+"_"+file.fieldname+"_"+Date.now());
    }
});

const profileupload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 10
    },
    fileFilter: (req, file, cb) => {
        checkFileType(file, cb);
    }
}).fields(
    [
        {
            name:'moa', maxCount:1
        },
        {
            name: 'aoa', maxCount:1
        },
        {
            name: 'incorporation', maxCount:1
        },
        {
            name: 'pan', maxCount:1
        },
        {
            name: 'gst', maxCount:1
        }
    ]
);

const cataloguestorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'C:/Users/Flash/Downloads/kenfeduploads')
    },
    filename:(req,file,cb)=>{
        cb(null, req.body.orgid+"_"+file.fieldname+"_"+Date.now());
    }
});

const catalogueupload = multer({
    storage: cataloguestorage,
    limits: {
        fileSize: 1024 * 1024 * 10
    },
    fileFilter: (req, file, cb) => {
        checkCatalogueFileType(file, cb);
    }
}).fields(
    [
        {
            name:'pictures', maxCount:10
        },
        {
            name: 'brochure', maxCount:1
        }
    ]
);

function checkFileType(file, cb) {
    if (
        file.mimetype === 'application/pdf'
      ) { // check file type to be pdf, doc, or docx
          cb(null, true);
          console.log("pdf true");
      } else {
          cb(null, false); // else fails
          console.log("pdf false");
      }
    
}
function checkCatalogueFileType(file, cb,page) {
    if (
        file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/jpeg'
      ) { // check file type to be png, jpeg, or jpg
        cb(null, true);
        console.log("image true");
      } else {
        cb(null, false); // else fails
        console.log("image false");
      }
}

router.post('/user/create',function(req,res,next){
    console.log("registration post test");
    console.log(req.body);
    const user = req.body;
    let insertQuery = `insert into users(name, email, password, role, loginstatus) values('${user.firstname}', '${user.email}', '${user.password}', 'member','Y') RETURNING id`
    client.query(insertQuery, (err, result)=>{
        if(!err)
        {
            console.log('Insertion was successful');
            console.log('row inserted with id: ' + result.rows[0].id);
            let regInsertQuery = `insert into user_profile(userid, firstname, surname, email, mobileno, status) values(${result.rows[0].id}, '${user.firstname}', '${user.surname}', '${user.email}','${user.mobilenumber}','REGISTERED')`
            client.query(regInsertQuery, (err1, result1)=>{
                if(!err1)
                {                  
                    let orgInsertQuery = `insert into user_organisation(userid, organisation, isprimary, location, active) values(${result.rows[0].id}, '${user.nameoforg}','Y','${user.location}','Y')`
                    client.query(orgInsertQuery, (err2, result2)=>{
                        if(!err2)
                        {
                            return res.json({"status":"success"});
                        }
                        else
                        {
                            console.log(err2.message);                     
                            return res.json({"status":"error"});
                        }
                    })    

                }
                else
                {
                    console.log(err1.message);                     
                    return res.json({"status":"error"});
                }
            })  
        }
        else
        { 
            console.log(err.message) ;
            return res.json({"status":"error"});
        }
    });
    client.end;      
});


router.get('/user/verify', (req, res,next)=>{
    console.log("verify user");
    console.log(req.query);
    let selectQuery=`Select * from users where email='${req.query.email}' and password='${req.query.password}'`
    client.query(selectQuery, (err, result)=>{
        if(!err)
        {
            console.log(result.rows);              
            if(result.rows.length>0)
            {
                if(result.rows[0].role=='admin')
                {
                    return res.json({"status":"success","userid":result.rows[0].id,"userrole":result.rows[0].role});

                }
                if(result.rows[0].role=='member')
                {
                    let selectRegQuery=`Select * from user_profile where userid=${result.rows[0].id}`
                    console.log(selectRegQuery);
                    client.query(selectRegQuery, (err1, result1)=>{
                        if(!err1)
                        {
                            
                            if(result1.rows.length>0)
                            {
                                console.log(result1.rows[0].status);
                                return res.json({"status":"success","userstatus":result1.rows[0].status,"userid":result.rows[0].id,"userrole":result.rows[0].role});
                            }
                            else
                            {
                                return res.json({"status":"error"});
                            }
                            
                        }
                        else
                        {
                            return res.json({"status":"error"});
                        }  

                    });
                }
                
                
            }
            else
            {
                return res.json({"status":"error"});
            }          
        }
        else
        {
            console.log(err.message) ;
            return res.json({"status":"error"});
        }
    });
    client.end;
});

router.get('/user/:id', (req, res, next)=>{
    console.log(req.params);
    client.query(`Select * from users where id=${req.params.id}`, (err, result)=>{
        if(!err){

            if(result.rows.length>0)
            {
                
                console.log(result.rows[0]);
                return res.json({"status":"success","username":result.rows[0].name,"role":result.rows[0].role,"email":result.rows[0].email});
            }
            else
            {
                return res.json({"status":"error"});
            }
        }
        else
        {
            return res.json({"status":"error"});
        }
    });
    client.end;
});

router.get('/user/profile/list', (req, res, next)=>{
    console.log(req.params);
    let selectQuery=`Select p.id,p.userid,p.firstname as username,p.surname,p.email,p.status,p.mobileno,o.organisation,o.location,o.logo from user_profile p inner join user_organisation o on p.userid = o.userid  where o.isprimary='Y' and o.active='Y'`
    client.query(selectQuery, (err, result)=>{
        if(!err){

            if(result.rows.length>0)
            {
                console.log(result.rows);
                return res.json({"status":"success","members":result.rows});
            }
            else
            {
                return res.json({"status":"error"});
            }
        }
        else
        {
            return res.json({"status":"error"});
        }
    });
    client.end;
});

router.get('/user/profile/:id', (req, res, next)=>{
    console.log(req.params);
    console.log("get user profile data for "+req.params.id);
    let selectQuery=`Select p.firstname as username,p.surname,p.email,p.mobileno,p.status as userstatus,TO_CHAR(p.submittedat , 'DD/MM/YYYY') as submittedat,o.id as orgid,o.organisation,o.location,o.logo,o.moa,o.aoa,o.incorporation,o.pan,o.gst from user_profile p inner join user_organisation o on p.userid = o.userid  where o.isprimary='Y' and o.active='Y' and p.userid=${req.params.id}`
    console.log(selectQuery);
    client.query(selectQuery, (err, result)=>{
        if(!err){
            console.log(result.rows[0]);               
            if(result.rows.length>0)
            {
                var user_profile_res={"status":"success"};
                Object.entries(result.rows[0]).forEach(([key, value]) => { 
                    console.log(key+" : "+value); 
                    user_profile_res[key]=value;                   
                    // if(key=='moa')
                    // {
                    //     var contents = fs.readFileSync(value, {encoding: 'base64'});
                    //     console.log(contents);
                    //     user_profile_res[key]=contents; 
                    // }
                    // else
                    // {
                    //     user_profile_res[key]=value;
                    // }

                });
                // console.log(user_profile_res);

                return res.json(user_profile_res);
            }
            else
            {
                return res.json({"status":"error"});
            }
        }
        else
        {
            return res.json({"status":"error"});
        }
    });
    client.end;
});

router.post('/user/profile/status/update', (req, res, next)=>{
    console.log("user profile status upload");
    console.log(req.body);
    var updateQuery = `update user_profile set status = '${req.body.status}' where userid = ${req.body.member}`
    console.log(updateQuery);
    client.query(updateQuery, (err, result)=>{
        if(!err){
            console.log("update successful");
            return res.json({"status":"success"});
        }
        else{ 
            console.log(err.message) 
            return res.json({"status":"error"});
        }
    })
    client.end;
    
});

router.post('/user/profile/update/:id',profileupload, (req, res, next)=>{
    console.log("user profile upload");
    console.log(req.files);
    var fileKeys = Object.keys(req.files);
    var fileObj={};
    fileKeys.forEach(function(key) {
        console.log(req.files[key][0].fieldname+" : "+req.files[key][0].path);
        fileObj[req.files[key][0].fieldname]=req.files[key][0].path;
    });
    var updateQuery = `update user_organisation
                       set moa = '${fileObj.moa}',
                       aoa = '${fileObj.aoa}',
                       incorporation = '${fileObj.incorporation}',
                       pan = '${fileObj.pan}',
                       gst = '${fileObj.gst}'
                       where userid = ${req.params.id}`
    console.log(updateQuery);
    client.query(updateQuery, (err, result)=>{
        if(!err){
            var statusUpdQuery=`update user_profile set status = 'SUBMITTED' where userid = ${req.params.id}`
            client.query(statusUpdQuery, (err1, result1)=>{
                if(!err1)
                {
                    console.log("update successful");
                    return res.json({"status":"success"});
                }
                else
                {
                    console.log(err1.message) 
                    return res.json({"status":"error"});
                }
            });

            
        }
        else{ 
            console.log(err.message) 
            return res.json({"status":"error"});
        }
    })
    client.end;
    
});

router.get('/surname/list', (req, res, next)=>{
    console.log(req.params);
    let selectQuery=`Select * from m_surname  where active='Y'`
    client.query(selectQuery, (err, result)=>{
        if(!err){

            if(result.rows.length>0)
            {
                console.log(result.rows);
                return res.json({"status":"success","list":result.rows});
            }
            else
            {
                return res.json({"status":"error"});
            }
        }
        else
        {
            return res.json({"status":"error"});
        }
    });
    client.end;
});

router.post('/organisation/catalogue/create',catalogueupload,function(req,res,next){
    console.log("org catalogue create");
    // console.log(req.files);
    const catalogue = req.body;
    console.log(catalogue);
    var fileKeys = Object.keys(req.files);
    var fileObj={};
    fileKeys.forEach(function(key) {
        console.log(req.files[key][0].fieldname+" : "+req.files[key][0].path);
        if(req.files[key][0].fieldname=='brochure')
        {
            fileObj["brochure"]=req.files[key][0].path;
        }
        if(req.files[key][0].fieldname=='pictures')
        {
            
            var picarr=[];
            // console.log(req.files[key])
            for(var i=0;i<req.files[key].length;i++)
            {
                // console.log(req.files[key][i]);
                picarr.push(req.files[key][i].path);
            }
            fileObj["pictures"]=picarr;
        
        }

        
    });
    
    console.log(fileObj);
    var category=''
    let insertQuery = `insert into organisation_catalogue(organisationid,name, description, specifications,category, pricerange, pictures,brochure,active) values('${req.body.orgid}', '${req.body.name}', '${req.body.description}', '${req.body.specifications}', '${req.body.category}', '${req.body.pricerange}','${fileObj.pictures}','${fileObj.brochure}','Y') RETURNING id`
    console.log(insertQuery);
    client.query(insertQuery, (err, result)=>{
        if(!err)
        {
            console.log('Insertion was successful');
            console.log('row inserted with id: ' + result.rows[0].id);
            return res.json({"status":"success"});
        }
        else
        { 
            console.log(err.message) ;
            return res.json({"status":"error"});
        }
    });
    client.end;      
});

router.get('/organisation/catalogue/:id', (req, res, next)=>{
    console.log(req.params);
    let selectQuery=`Select * from organisation_catalogue  where active='Y' and organisationid=${req.params.id}`
    client.query(selectQuery, (err, result)=>{
        if(!err){

            console.log(result.rows);
            return res.json({"status":"success","list":result.rows});
        }
        else
        {
            return res.json({"status":"error"});
        }
    });
    client.end;
});

router.get('/organisation/catalogue/list', (req, res, next)=>{
    console.log(req.params);
    let selectQuery=`Select * from organisation_catalogue where active='Y'`
    client.query(selectQuery, (err, result)=>{
        if(!err){
            console.log(result.rows);
            return res.json({"status":"success","list":result.rows});
        }
        else
        {
            return res.json({"status":"error"});
        }
    });
    client.end;
});

module.exports = router;