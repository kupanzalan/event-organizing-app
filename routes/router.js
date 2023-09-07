import express from 'express';
import bodyParser from 'body-parser';
import multer from 'multer';
import path from 'path';
import * as controller from '../controllers/controller.js';
import * as validator from '../middlewares/validator.js';
import * as authenticator from '../middlewares/authenticator.js';
import Event from '../models/event.js';
import Organizer from '../models/organizer.js';
import Image from '../models/image.js';
import Task from '../models/task.js';

const router = express.Router();

router.use(bodyParser.json());
const urlencodedParser = bodyParser.urlencoded({
  extended: false,
});

const storagefile = multer.diskStorage({
  destination: './public/uploads',
  filename: (req, file, cb) => {
    cb(
      null,
      `${file.fieldname} - ${Date.now()}${path.extname(file.originalname)}`,
    );
  },
});

const upload = multer({ storage: storagefile });

// Display form to add new event
router.get('/events',
  authenticator.authenticateUser,
  authenticator.isAdmin,
  (req, res) => {
    let isAdmin = false;
    if (res.locals.role === 'admin') {
      isAdmin = true;
    }
    res.render('event', { layout: 'index', username: res.locals.name, admin: isAdmin });
  });

// Display login form
router.get('/login', (req, res) => {
  console.log('GET /login');
  res.render('login', { layout: 'index' });
});

// Display register form
router.get('/register', (req, res) => {
  console.log('GET /register');
  res.render('register', { layout: 'index' });
});

router.get('/adminevents',
  authenticator.authenticateUser,
  authenticator.isAdmin,
  (req, res) => {
    console.log('GET /adminevents');
    console.log(res.locals.name);
    Event.find({ eventCreator: res.locals.name })
      .lean()
      .then((result) => {
        console.log(result);
        let isAdmin = false;
        if (res.locals.role === 'admin') {
          isAdmin = true;
        }
        res.render('adminevents', {
          layout: 'index', event: result, username: res.locals.name, admin: isAdmin,
        });
      })
      .catch((error) => {
        console.log(error);
      });
  });

router.get('/adminorganizers',
  authenticator.authenticateUser,
  authenticator.isAdmin,
  (req, res) => {
    Organizer.find({ eventid: req.query.id })
      .lean()
      .then((result) => {
        let isAdmin = false;
        if (res.locals.role === 'admin') {
          isAdmin = true;
        }
        console.log(`req.query.id: ${req.query.id}`);
        Task.find({ eventid: req.query.id })
          .lean()
          .then((resultTask) => {
            console.log(resultTask);
            res.render('adminorganizers', {
              layout: 'index', org: result, event: req.query.id, eventid: req.query.id, task: resultTask, username: res.locals.name, admin: isAdmin,
            });
          })
          .catch((error) => {
            console.log(error);
          });
      })
      .catch((error) => {
        console.log(error);
      });
  });

router.get('/cancelorganizer',
  authenticator.authenticateUser,
  authenticator.isAdmin,
  (req, res) => {
    console.log(req.query.name);
    console.log(req.query.eventid);
    Organizer.findOneAndDelete({
      name: req.query.name,
      eventid: req.query.eventid,
    })
      .then(() => {
        console.log(
          `Deleting ${req.query.name} from ${req.query.eventid}`,
        );
        res.redirect(`/adminorganizers?id=${req.query.eventid}`);
      })
      .catch((error) => {
        console.log(error);
      });
  });

// Display organizers events
router.get('/myevents',
  authenticator.authenticateUser,
  (req, res) => {
    console.log('GET /myevents');
    let isAdmin = false;
    if (res.locals.role === 'admin') {
      isAdmin = true;
    }
    const resEvent = [];
    Organizer.find({ name: res.locals.name })
      .lean()
      .then((result) => {
        console.log(result);
        return result;
      })
      .then((events) => {
        console.log(events);
        for (let i = 0; i < events.length; i += 1) {
          resEvent.push(events[i].eventid);
        }
        console.log(resEvent);
        Event.find({ _id: { $in: resEvent } })
          .lean()
          .then((resultEvents) => {
            console.log(resultEvents);
            res.render('myevents', {
              layout: 'index', event: resultEvents, username: res.locals.name, admin: isAdmin,
            });
          })
          .catch((error) => {
            console.log(error);
          });
      })
      .catch((error) => {
        console.log(error);
        res.redirect('/');
      });
  });

router.get('/organizers', (req, res) => {
  Event.find()
    .lean()
    .then((result) => {
      console.log(result);
      res.render('organizer', {
        layout: 'index',
        event: result,
        success: req.query.success,
        error: req.query.error,
      });
    })
    .catch((error) => {
      console.log(error);
    });
});

// Fetch all the organizers
router.get('/fetchorganizers', (req, res) => {
  Organizer.find()
    .lean()
    .then((result) => {
      console.log(result);
      res.json(result);
    })
    .catch((error) => {
      console.log(error);
      res.json({ ok: false });
    });
});

// Fetching an organizer
router.get('/getorganizer', (req, res) => {
  console.log(req.query.username);
  console.log(req.query.eventid);
  Event.findOne({ name: req.query.eventid })
    .then((resultEvent) => resultEvent._id)
    .then((resultId) => {
      Organizer.find({ name: req.query.username, eventid: resultId })
        .then((result) => {
          console.log(result);
          if (result.length === 0) {
            console.log('Not in database');
            res.json(result);
          } else {
            console.log('In database');
            res.json(result);
          }
        })
        .catch((error) => {
          console.log(error);
          res.json({ ok: false });
        });
    })
    .catch((error) => {
      console.log(error);
      res.json({ ok: false });
    });
});

router.get('/removeorganizer', (req, res) => {
  Organizer.findOneAndDelete({ name: req.query.name })
    .lean()
    .then(() => {
      console.log(`Organizer deleted: ${req.query.name}`);
    })
    .catch((error) => {
      console.log(error);
      res.json({ ok: false });
    });
  Organizer.find()
    .lean()
    .then((result) => {
      console.log(result);
      res.json(result);
    })
    .catch((error) => {
      console.log(error);
      res.json({ ok: false });
    });
});

// Fetch the list of users
router.get('/fetchlist', (req, res) => {
  Event.findOne({ name: req.query.name })
    .lean()
    .then((event) => {
      Organizer.find({ eventid: event._id })
        .lean()
        .then((org) => {
          console.log(org);
          res.json(org);
        })
        .catch((error) => {
          console.log(error);
          res.json({ ok: false });
        });
    })
    .catch((error) => {
      console.log(error);
      res.json({ ok: false });
    });
});

// Get event details
router.get('/getdetails',
  urlencodedParser,
  authenticator.authenticateUser,
  (req, res) => {
    let images;
    let notorg;
    let isAdmin = false;
    if (res.locals.role === 'admin') {
      isAdmin = true;
    }
    if (req.query.org === 1) {
      notorg = 'Not organizer at this event';
    }
    Image.find({ eventid: req.query.id })
      .lean()
      .then((imagesRes) => {
        console.log(imagesRes);
        images = imagesRes;
      })
      .catch((error) => {
        console.log(`Error ${error}`);
      });
    Event.find({ _id: req.query.id })
      .lean()
      .then((result) => Organizer.find({ eventid: req.query.id })
        .lean()
        .then((organizers) => [result, organizers]))
      .then(([result, organizers]) => {
        Task.find({ eventid: req.query.id })
          .lean()
          .then((resultTask) => {
            res.render('details', {
              layout: 'index',
              event: result,
              task: resultTask,
              org: organizers,
              eventid: req.query.id,
              notorganizer: notorg,
              image: images,
              username: res.locals.name,
              admin: isAdmin,
            });
          });
      })
      .catch((error) => {
        res.render('details', { layout: 'index', error: `Error fetching organizers ${error}` });
      });
  });

router.get('/dotask',
  authenticator.authenticateUser,
  controller.doTask);

// Insert dexcription of a task
router.post('/insertdescription',
  urlencodedParser,
  authenticator.authenticateUser,
  authenticator.isAdmin,
  controller.insertDescription);

// Upload photos
router.post(
  '/upload',
  upload.single('myfile'),
  authenticator.authenticateUser,
  controller.uploadPhoto,
  (req, res) => {
    console.log('POST /checkupload');
    res.render('details', {
      layout: 'index',
      error: 'Error completing the form',
    });
  },
);

// Get all the events
router.get('/',
  authenticator.authenticateUser,
  (req, res) => {
    Event.find()
      .lean()
      .then((result) => {
        console.log(result);
        let isAdmin = false;
        if (res.locals.role === 'admin') {
          isAdmin = true;
        }
        res.render('events', {
          layout: 'index', event: result, username: res.locals.name, admin: isAdmin,
        });
      })
      .catch((error) => {
        console.log(error);
      });
  });

// Register a new user
router.post(
  '/registeruser',
  urlencodedParser,
  validator.registerValidationRules(),
  validator.validate,
  controller.registerUser,
  (req, res) => {
    console.log('/POST registeruser');
    res.render('register', {
      layout: 'index',
      errors: 'Error completing the form',
    });
  },
);

// Login user
router.post(
  '/loginuser',
  urlencodedParser,
  validator.loginValidationRules(),
  validator.validate,
  controller.checkUser,
);

// Log out user
router.get(
  '/signout',
  urlencodedParser,
  (req, res) => {
    res.clearCookie('jwt');
    req.cookies.jwt = undefined;
    res.locals.email = undefined;
    res.locals.name = undefined;
    res.locals.role = undefined;
    res.redirect('/login');
  },
);

// User join event
router.get('/join',
  authenticator.authenticateUser,
  controller.enrollUser);

// User cancel joining event
router.get('/cancel',
  authenticator.authenticateUser,
  controller.cancelUser);

// Create a new event
router.post(
  '/create',
  urlencodedParser,
  validator.eventValidationRules(),
  validator.validate,
  authenticator.authenticateUser,
  authenticator.isAdmin,
  controller.insertEvent,
  (req, res) => {
    console.log('POST /create');
    res.render('event', {
      layout: 'index',
      errors: 'Error completing the form',
    });
  },
);

router.post(
  '/register',
  urlencodedParser,
  validator.userValidationRules(),
  validator.validate,
  controller.insertOrganizer,
  (req, res) => {
    console.log('POST /register');
    res.render('organizer', {
      layout: 'index',
      errors: 'Error completing the form',
    });
  },
);

router.post(
  '/cancel',
  urlencodedParser,
  validator.userValidationRules(),
  validator.validate,
  controller.deleteOrganizer,
  (req, res) => {
    console.log('POST /cancel');
    res.render('organizer', {
      layout: 'index',
      errors: 'Error completing the form',
    });
  },
);

export default router;
