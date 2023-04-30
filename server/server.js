const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = 8000;

const { MongoClient, ServerApiVersion } = require('mongodb');
const { response } = require('express');
const uri = "mongodb+srv://chiragsindhu:chiragsindhu@dlms.mzzehnj.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

app.use(cors({credentials: true, origin: true}));
app.use(bodyParser.json());

app.get('/checkuserlogindetail', async (request, response) => {
  const uniqueID = request.query.unique;
  const password = request.query.pass;

  var data = await client.db('DLMS').collection('logindetail').findOne({uniquenumber: uniqueID});
  if(data == null) { response.json({status: "User does not exist"}).end(); }
  else { var databasePassword = data.password;
    if(password === databasePassword) { response.json({...data, status: "Success"}).end(); }
    else { response.json({status: "Password does not matched"}).end(); }
  }
});

app.get('/getbook', async (request, response) => {
  var data = await client.db('DLMS').collection('bookdetail').find().limit(10);
  var bookData = [];
  await data.forEach((doc) => 
  {
    bookData =[doc, ...bookData];
  });

  //console.log(bookData);
  response.json({bookData}).status(200).end();
})

app.get('/findbook', async (request, response) => 
{
  const search = request.query.name;
  const data = await client.db('DLMS').collection('bookdetail').find({name: {'$regex' : search, '$options' : 'i'}}).limit(10);

  var bookData = [];
  await data.forEach((doc) => 
  {
    bookData =[doc, ...bookData];
  });

  //console.log(bookData);
  response.json({bookData}).status(200).end();
});

app.get('/borrowbook', async (request, response) => {
  try
  {
    const barcode = request.query.barcode;
    const uniquenumber = request.query.uniquenumber;

    const doc = {
      barcode: barcode,
      uniquenumber: uniquenumber,
      date: new Date()
    }

    const insert = await client.db('DLMS').collection('borrowdetail').insertOne(doc);
    response.status(200).json({ message: 'Sucess' });
  }catch(e)
  {
    response.status(200).json({ message: 'Something went wrong' });
  }
});

app.get('/checkborrow', async (request, response) => {
  const barcode = request.query.barcode;
  const uniquenumber = request.query.uniquenumber;

  const result = await client.db('DLMS').collection('borrowdetail').findOne({barcode:barcode, uniquenumber: uniquenumber});

  if(result === null)
  {
    response.json({message: "no"}).end;
  }else
  {
    response.json({message: "yes" , date: result.date}).end;
  }
});

app.get('/reportData', async (request, response) => {
  const uniquenumber = request.query.uniquenumber;

  const reportData = await client.db('DLMS').collection('borrowdetail').aggregate([
    {
      $match: { uniquenumber: uniquenumber }
   },
    { $lookup:
       {
         from: 'bookdetail',
         localField: 'barcode',
         foreignField: 'barcode',
         as: 'bookdetail'
       }
     }
    ]).sort({date:1});
  
  var bookData = [];
  await reportData.forEach((doc) => {
    bookData =[doc, ...bookData];
  });

  response.json({bookData}).status(200).end();
});

app.get('/returnbook', async (request, response) => {
  try
  {
    const barcode = request.query.barcode;
    const uniquenumber = request.query.uniquenumber;

    const result = await client.db('DLMS').collection('borrowdetail').deleteOne({barcode:barcode, uniquenumber: uniquenumber});

    response.status(200).json({ message: 'Sucess' });
  }catch(e)
  {
    response.status(200).json({ message: 'Something went wrong' });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
  ConnectToDatabase();
});

async function ConnectToDatabase()
{
  await client.connect();
  console.log("Database Connected");
}

const functions = require('firebase-functions');
exports.api = functions.https.onRequest(app)