import { check, validationResult } from 'express-validator';

export const eventValidationRules = () => [
  check('eventname').notEmpty().withMessage('Name can not be empty'),
  check('startdate').notEmpty().withMessage('Date can not be empty'),
  check('enddate').notEmpty().withMessage('Date can not be empty'),
  check('location').notEmpty().withMessage('Location can not be empty'),
];

export const userValidationRules = () => [
  check('organizername').notEmpty().withMessage('Name can not be empty'),
];

export const registerValidationRules = () => [
  check('username').notEmpty().withMessage('Name can not be empty'),
  check('useremail').notEmpty().withMessage('Date can not be empty'),
  check('userpassword').notEmpty().withMessage('Date can not be empty'),
  check('userpasswordcnf').notEmpty().withMessage('Date can not be empty'),
];

export const loginValidationRules = () => [
  check('useremail').notEmpty().withMessage('Email can not be empty'),
  check('userpassword').notEmpty().withMessage('Password can not be empty'),
];

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  const extractedErrors = [];
  errors.array().map((err) => extractedErrors.push({ [err.param]: err.msg }));

  return res.status(422).json({
    errors: extractedErrors,
  });
};
