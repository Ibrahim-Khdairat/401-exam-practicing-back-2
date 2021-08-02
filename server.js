'use strict';

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose')
const axios = require('axios');
const server = express();
server.use(express.json());
server.use(cors());
const PORT = process.env.PORT || 3001;

mongoose.connect(`mongodb://ibrahim:0010097790@cluster0-shard-00-00.ekaaj.mongodb.net:27017,cluster0-shard-00-01.ekaaj.mongodb.net:27017,cluster0-shard-00-02.ekaaj.mongodb.net:27017/test?ssl=true&replicaSet=atlas-53s6ul-shard-0&authSource=admin&retryWrites=true&w=majority`, { useNewUrlParser: true, useUnifiedTopology: true });



const PlaceSchema = new mongoose.Schema({
  Placename: String,
  PlaceImage: String
})


const UsersSchema = new mongoose.Schema({
  email: String,
  places: [PlaceSchema]
})

const UserModel = mongoose.model('Visitors', UsersSchema);


function SeedUsers() {
  let ibrahim = new UserModel(
    {
      email: 'ibrahimkuderat@gmail.com',
      places: [
        {
          Placename: 'Aqaba',
          PlaceImage: "https://images.unsplash.com/photo-1613778916205-4834433f0047?ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8YXFhYmF8ZW58MHx8MHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
        }
      ]
    }
  )

  let Razan = new UserModel(
    {
      email: 'Razan@gmail.com',
      places: [
        {
          Placename: 'Aqaba',
          PlaceImage: "https://images.unsplash.com/photo-1613778916205-4834433f0047?ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8YXFhYmF8ZW58MHx8MHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
        }
      ]
    }
  )

  ibrahim.save();
  Razan.save();

}
// SeedUsers ();




class Places {
  constructor(Placename, PlaceImage) {
    this.Placename = Placename,
      this.PlaceImage = PlaceImage
  }
}


let inMemory = [];


server.get('/places', async (req, res) => {

  if (inMemory.length !== 0) {
    console.log('already have data')
    res.send(inMemory)
  }
  else {
    console.log('new request')

    let APIData = await axios.get('https://jordan-black-iris.herokuapp.com/places')
    let dataFromApi = APIData.data.map(place => {
      return new Places(place.name, place.img)
    })
    inMemory = dataFromApi;
    res.send(dataFromApi)
  }


})




server.get('/favplaces/:email', gettingFavPlaces);
server.post('/addtofav/:email' ,addToFav);
server.delete('/deleteplaces/:email' , deletePlace)
server.put('/updateplace/:email' , updatePlace)

function gettingFavPlaces(req, res) {
  let userEmail = req.params.email
  UserModel.find({ email: userEmail }, (error, Data) => {
    if (error) {
      res.send(error)
    }
    else {
      res.send(Data[0].places)
    }
  })
}


function addToFav (req,res) {
  let userEmail = req.params.email;
  const { Placename , PlaceImage } = req.body;

  UserModel.find({email : userEmail}  ,(error , Data) =>{
    if (error) {
      res.send(error)
    }
    else {
      Data[0].places.push(
      {
        Placename : Placename,
        PlaceImage : PlaceImage
      })

      Data[0].save();
      res.send(Data[0].places)
    }
  })
}


function deletePlace (req,res) {
  let userEmail = req.params.email;
  let placeIndex = Number(req.query.index);
  
  UserModel.find({email : userEmail} , (error , Data) =>{
    if (error) {
      res.send(error)
    }
    else {
      let filtered = Data[0].places.filter((place,index) =>{
        if (index !== placeIndex ) { return place }
      })
      Data[0].places = filtered;
      Data[0].save();
      res.send(Data[0].places)
    }
  })
}

function updatePlace (req , res ) {
  let userEmail = req.params.email;
  let placeIndex = req.query.index;
  const { Placename , PlaceImage } = req.body;

  UserModel.find({email : userEmail} , (error ,Data) =>{
    if (error) {
      res.send(error)
    }
    else {
      console.log('before : ',Data[0].places);
      Data[0].places.splice(placeIndex , 1 , {
        Placename : Placename,
        PlaceImage : PlaceImage
      })
      Data[0].save();
      console.log('after : ',Data[0].places);

      res.send(Data[0].places)
    }
  })
}

server.get('/', (request, response) => {
  response.send('All good ...')
})

server.listen(3001, () => console.log(`listening on ${3001}`));
