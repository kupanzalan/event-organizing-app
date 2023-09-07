import jwt from 'jsonwebtoken';

export const authenticateUser = (req, res, next) => {
  if (req.cookies) {
    if (req.cookies.jwt) {
      jwt.verify(req.cookies.jwt, process.env.JWT_KEY, (err, decoded) => {
        if (err) {
          console.log('JWT not valid');
          res.redirect('/');
        } else {
          console.log(decoded);
          res.locals.role = decoded.role;
          res.locals.name = decoded.name;
          next();
        }
      });
    } else {
      res.render('login', { layout: 'index', errors: 'Not logged in!' });
    }
  } else {
    res.redirect('/login');
  }
};

export const isAdmin = (req, res, next) => {
  if (res.locals.role === 'admin') {
    next();
  } else {
    res.redirect('/');
  }
};
