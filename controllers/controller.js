import url from 'url';
import fs from 'fs';
import { promisify } from 'util';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import Event from '../models/event.js';
import Organizer from '../models/organizer.js';
import Image from '../models/image.js';
import User from '../models/users.js';
import Task from '../models/task.js';
import Worker from '../models/worker.js';

const hashSize = 32,
  saltSize = 16,
  hashAlgorithm = 'sha512',
  iterations = 1000;

const pbkdf2 = promisify(crypto.pbkdf2);
const unlinkAsync = promisify(fs.unlink);

export const insertEvent = (req, res) => {
  const mongoEvent = new Event({
    name: req.body.eventname,
    startdate: req.body.startdate,
    enddate: req.body.enddate,
    location: req.body.location,
    eventCreator: res.locals.name,
  });

  mongoEvent
    .save()
    .then((result) => {
      console.log(result);
      res.redirect('/');
    })
    .catch((error) => {
      console.log(error);
      res.render('event', {
        layout: 'index',
        errors: `Error at inserting event: ${error}`,
      });
    });
};

// Register and login
export const registerUser = async (req, res) => {
  const salt = crypto.randomBytes(saltSize);
  const hash = await pbkdf2(req.body.userpassword, salt, iterations, hashSize, hashAlgorithm);
  const hashWithSalt = Buffer.concat([hash, salt]).toString('hex');
  const newUser = new User({
    name: req.body.username,
    email: req.body.useremail,
    password: hashWithSalt,
    role: req.body.role,
  });

  newUser
    .save()
    .then((result) => {
      console.log(result);
      res.redirect('/login');
    })
    .catch((error) => {
      console.log(error);
      res.render('register', { layout: 'index', errors: error });
    });
};

export const checkUser = (req, res) => {
  User.findOne({ email: req.body.useremail })
    .then(async (result) => {
      const expectedHash = result.password.substring(0, hashSize * 2),
        salt = Buffer.from(result.password.substring(hashSize * 2), 'hex');
      const binaryHash = await pbkdf2(req.body.userpassword, salt, iterations,
        hashSize, hashAlgorithm);
      const actualHash = binaryHash.toString('hex');
      if (expectedHash === actualHash) {
        console.log(result.role);
        const token = jwt.sign({
          email: req.body.useremail,
          name: result.name,
          role: result.role,
        },
        process.env.JWT_KEY,
        {
          expiresIn: '20 min',
        });
        res.cookie('jwt', token, { maxAge: 1200000, httpOnly: true, secure: true });
        req.cookies.jwt = token;
        res.redirect('/');
      } else {
        res.render('login', { layout: 'index', errors: 'Incorrect password' });
      }
    })
    .catch((error) => {
      console.log(error);
    });
};

export const enrollUser = (req, res) => {
  Event.findOne({ name: req.query.event })
    .lean()
    .then((result) => Organizer.find({ name: res.locals.name, eventid: result._id })
      .lean()
      .then((foundUser) => {
        if (foundUser.length === 0) {
          return result._id;
        }
        return undefined;
      }))
    .then((resultId) => {
      if (resultId === undefined) {
        res.redirect('/');
      } else {
        const newOrganizer = new Organizer({
          name: res.locals.name,
          eventid: resultId,
        });
        newOrganizer
          .save()
          .then(() => {
            console.log(`Saved user ${res.locals.name} from ${resultId}`);
            res.json(newOrganizer);
          })
          .catch((error) => {
            console.log(error);
            res.json({ ok: false });
          });
      }
    })
    .catch((error) => {
      console.log(error);
      res.json({ ok: false });
    });
};

export const cancelUser = (req, res) => {
  Event.findOne({ name: req.query.event })
    .lean()
    .then((result) => Organizer.find({ name: res.locals.name, eventid: result._id })
      .lean()
      .then((foundUser) => {
        if (foundUser.length === 0) {
          return undefined;
        }
        return result._id;
      }))
    .then((resultId) => {
      if (resultId === undefined) {
        res.redirect('/');
      } else {
        Organizer.findOneAndDelete({ name: res.locals.name, eventid: resultId })
          .then(() => {
            console.log(`Deleted user ${res.locals.name} from ${resultId}`);
            console.log(`res.locals.name: ${res.locals.name}`);
            res.json({ name: res.locals.name });
          })
          .catch((error) => {
            console.log(error);
            res.json({ ok: false });
          });
      }
    })
    .catch((error) => {
      console.log(error);
      res.json({ ok: false });
    });
};

export const insertDescription = (req, res) => {
  const newTask = new Task({
    description: req.body.taskdesc,
    eventid: req.query.eventid,
    freePlaces: req.body.freeplaces,
    due: req.body.duedate,
  });

  newTask
    .save()
    .then((result) => {
      console.log(result);
      res.redirect(`/adminorganizers?id=${req.query.eventid}`);
    })
    .catch((error) => {
      console.log(error);
      res.status(400).json({
        error: `Errors: ${error}`,
      });
    });
};

export const doTask = (req, res) => {
  const newWork = new Worker({
    name: res.locals.name,
    taskId: req.query.taskid,
  });

  newWork
    .save()
    .then((result) => {
      console.log(result);
      res.redirect(`/getdetails?id=${req.query.eventid}`);
    })
    .catch((error) => {
      console.log(error);
      res.status(400).json({
        error: `Errors: ${error}`,
      });
    });
};

// Organizer and event CRUD
export const insertOrganizer = (req, res) => {
  console.log(`req.body.eventid: ${req.body.eventid}`);
  console.log(`req.body.organizername: ${req.body.organizername}`);
  Event.find({ _id: req.body.eventid })
    .lean()
    .then(() => Organizer.find({
      name: req.body.organizername,
      eventid: req.body.eventid,
    }))
    .then((org) => {
      console.log(org);
      if (org.length === 0) {
        console.log('Not yet enrolled');
        new Organizer({
          name: req.body.organizername,
          eventid: req.body.eventid,
        })
          .save()
          .then(() => {
            res.redirect(
              url.format({
                pathname: '/organizers',
                query: {
                  success: `Successfully enrolled ${req.body.organizername} to ${req.body.eventid}`,
                },
              }),
            );
          })
          .catch((error) => {
            console.log(error);
          });
      } else {
        console.log('Enrolled already');
        res.redirect(
          url.format({
            pathname: '/organizers',
            query: {
              error: `Enrolled already to this event: ${req.body.eventid}`,
            },
          }),
        );
      }
    })
    .catch((error) => {
      console.log(`Callback error ${error}`);
      res.redirect(
        url.format({
          pathname: '/organizers',
          query: {
            error: `No such event: ${req.body.eventid}`,
          },
        }),
      );
    });
};

export const deleteOrganizer = (req, res) => {
  Event.find({ _id: req.body.eventid })
    .then((result) => {
      console.log(result);
      return Organizer.find({
        name: req.body.organizername,
        eventid: req.body.eventid,
      });
    })
    .then((org) => {
      console.log(org);
      if (org.length === 0) {
        res.render('organizer', {
          layout: 'index',
          error: `You are not organizer at this event: ${req.body.eventid}`,
        });
      } else {
        Organizer.findOneAndDelete({
          name: req.body.organizername,
          eventid: req.body.eventid,
        })
          .then(() => {
            console.log(
              `Deleting ${req.body.organizername} from ${req.body.eventid}`,
            );
            res.redirect(
              url.format({
                pathname: '/organizers',
                query: {
                  success: `Successfully removed ${req.body.organizername} from ${req.body.eventid}`,
                },
              }),
            );
          })
          .catch((error) => {
            console.log(`Callback error: ${error}`);
            res.redirect(
              url.format({
                pathname: '/organizers',
                query: {
                  error: `Callback error: ${error}`,
                },
              }),
            );
          });
      }
    })
    .catch((error) => {
      console.log(`Callback error no such event ${error}`);
      res.redirect(
        url.format({
          pathname: '/organizers',
          query: {
            error: `No such event: ${req.body.eventid}`,
          },
        }),
      );
    });
};

export const uploadPhoto = (req, res) => {
  Organizer.find({ name: res.locals.name, eventid: req.body.eventid })
    .then((org) => {
      console.log(`res.locals.name: ${res.locals.name}`);
      console.log(`req.body.eventid: ${req.body.eventid}`);
      if (org.length === 0) {
        unlinkAsync(req.file.path);
        res.redirect(url.format({
          pathname: '/getdetails',
          query: {
            id: req.body.eventid,
            org: 1,
          },
        }));
      } else {
        const eventImage = new Image({
          filename: req.file.filename,
          eventid: req.body.eventid,
        });
        eventImage
          .save()
          .then((result) => {
            console.log(result);
            res.redirect(url.format({
              pathname: '/getdetails',
              query: {
                id: req.body.eventid,
              },
            }));
          })
          .catch((error) => {
            console.log(error);
          });
      }
    })
    .catch((error) => {
      res.send(`Error uploading image: ${error}`);
    });
};
