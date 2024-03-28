const express = require('express');
const cors = require('cors');
const sequelize = require('./database');
require('dotenv').config();
const app = express();
const apiRouter = require('./routers/index');
const { default: stripeWebhook } = require('./middlewares/stripeWebhook');

app.use(express.json());
app.use(cors());
app.use('/api/v1', apiRouter);

app.get('/',(_,res)=>{
  res.send('Hello World');
})
app.post('/webhook', stripeWebhook);

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`)
  sequelize.authenticate()
    .then(() => {
      console.log('Database connected');
    })
    .catch((err) => {
      console.log('Unable to connect to the database:', err);
    });
    // sequelize.sync();
})