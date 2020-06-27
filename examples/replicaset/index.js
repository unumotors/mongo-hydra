const express = require('express')
const mongoose = require('mongoose')

const app = express()

mongoose.connect('mongodb://rs-0:27017,rs-1:27011,rs-2:27017/test', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})

const pageViewScheme = new mongoose.Schema({
  date: { type: Date, default: Date.now }
})
const PageView = mongoose.model('pageviews', pageViewScheme)

app.get('/', (req, res) => {
  console.log(req)
  const pageview = new PageView()
  pageview.save()

  PageView.count((err, count) => {
    res.send(`Count documents found [${count}] refresh the page`)
  })
})

app.listen(3000, ()=> {
  console.log('listening on port 300, http://localhost:3000')
})
