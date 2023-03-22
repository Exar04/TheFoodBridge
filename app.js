const express = require('express')
const mongoose = require('mongoose')
const morgan = require('morgan')
const User = require('./models/User') 
const Donation = require('./models/Donation') 
const Org = require('./models/Org') 

const app = express()

mongoose.connect("mongodb://localhost/TheFoodBridgeData")
    .then((result) => app.listen(4000))
    .catch((err) => console.log(err))


app.set('view engine', 'ejs')

// middleware and static files

app.use(express.static('public'))
app.use(express.urlencoded({ extended: true}))
app.use(morgan('dev'))


app.get('/', (req, res) => {
    res.render('index', { title : 'HOME'})
})

app.get('/about', (req, res) => {
    res.render('about', {title : 'About'})
})

app.get('/donate', (req, res) => {
    res.render( 'donate', { title: 'Donate'} )
})

app.post('/donation', (req, res) => {
    const donate = new Donation(req.body)
    donate.save()
        .then((result) => {
            Org.find({location: req.body.location})
                .then((result2) => {
                    result2.forEach(remailo => {
                        console.log('Sending message to following emails', remailo.email)
                    });
                    res.redirect('/donationList')
                })
        })
        .catch((err) => {
            console.log(err)
        })
})

app.get('/donationList', (req, res) => {
    Donation.find()
        .then((result)=>{

            res.render('donationList', {title: 'List', Donations: result})
        })
        .catch((err) => {
            console.log(err)
        })
})


app.get('/login', (req, res) => {
    res.render( 'login', { title: 'login'})
})

app.post('/login', async(req, res) => {
    try{
        const email = req.body.email
        const password = req.body.password

        const useremail = await User.findOne({email: email})

        if(useremail.password === password){
            res.redirect('/')
        }else{
            res.send('Wrong password')
        }

    }catch(err){
        res.status(400).send("Invalid Email")
    }
})


app.get('/register', (req, res) => {
    res.render( 'register', { title: 'register'})
})

app.post('/registerUser', (req, res) => {
    const user = new User(req.body)
    user.save()
        .then((result) => {
            res.redirect('/')
        })
        .catch((err) => {
            console.log(err)
        })
})

app.post('/registerOrg', (req, res) => {
    const org = new Org(req.body)
    org.save()
        .then((result) => {
            res.redirect('/')
        })
        .catch((err) => {
            console.log(err)
        })
})

app.use((req, res) => {
    res.status(404).render('404', { title: '404'})
})