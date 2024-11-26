import express from 'express';

import cors from 'cors';

import helmet from 'helmet';

import subscriptionRoutes from './api/routes/subscriptionRoutes';

import sequelize from './models/index';

import dotenv from 'dotenv';


dotenv.config(); // Load environment variables from .env


const app = express();

const PORT = process.env.PORT || 3000;


app.use(cors());

app.use(helmet());

app.use(express.json());


app.use('/api', subscriptionRoutes);


sequelize.sync().then(() => {

  app.listen(PORT, () => {

    console.log("Hi");

  });

}).catch ((err) => {

  console.error('Unable to connect to the database:', err);

});