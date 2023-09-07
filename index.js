import express from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import handlebars from 'express-handlebars';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import methodOverride from 'method-override';
import dotenv from 'dotenv';
import routes from './routes/router.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

const dbURI = 'mongodb+srv://zalan:zalan1234@weblabdb.caeme.mongodb.net/webprogdb?retryWrites=true&w=majority';
mongoose
  .connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => app.listen(port, () => console.log(`Connected to DB \nServer started on port ${port}`)))
  .catch((error) => console.log(error));

app.set('view engine', 'hbs');
app.engine(
  'hbs',
  handlebars({
    layoutsDir: './views/layouts',
    extname: 'hbs',
  }),
);

app.use(bodyParser.json());

app.use(methodOverride('__method'));

app.use(cookieParser());

app.use(routes);

app.use(express.static(path.join('.', 'static')));
app.use('/public/uploads', express.static(path.join('.', 'public/uploads')));
