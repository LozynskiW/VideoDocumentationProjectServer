require('dotenv').config();
const app = require('./app');
const mongoose = require('mongoose');

mongoose.connect(
    process.env.DB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })

const db = mongoose.connection
db.on('error', (error) => console.error(error));
db.once('open', () => console.log('Connected to DB'))

app.listen(3000, () => {
    console.log("App started")
})