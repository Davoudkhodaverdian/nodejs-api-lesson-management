const express = require('express')
const bodyParser = require('body-parser')
global.config = require('./modules/config')
const app = express()

var cors = require('cors')
// Enable All CORS Requests Cross-origin resource sharing (CORS)
app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({ type: 'application/json' }));

const webRouter = require('./modules/routs/web')
app.use('/', webRouter);
const apiRouter = require('./modules/routs/api')
app.use('/api', apiRouter);

app.listen(config.port, () => {
  console.log(`This app listening on port ${config.port}  http://localhost:${config.port}`)
})


