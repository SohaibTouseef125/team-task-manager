import Joi from 'joi';

// Registration validation schema
const registrationSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(100).required()
});

// Login validation schema
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(1).max(100).required()
});

// Profile update validation schema
const profileUpdateSchema = Joi.object({
  name: Joi.string().min(2).max(100),
  email: Joi.string().email(),
  bio: Joi.string().max(500),
  timezone: Joi.string().max(50),
  language: Joi.string().max(10),
  theme: Joi.string().max(20),
  notifications: Joi.object(),
  privacy: Joi.object(),
  location: Joi.string().max(100),
  job_title: Joi.string().max(100),
  company: Joi.string().max(100),
  website: Joi.string().uri().max(200),
  phone: Joi.string().max(20),
  avatar_url: Joi.string().uri().allow(null).max(500) // Allow avatar_url updates
}).min(1); // At least one field must be provided

// Password change validation schema
const passwordChangeSchema = Joi.object({
  oldPassword: Joi.string().min(1).max(100).required(),
  newPassword: Joi.string().min(6).max(100).required()
});

// Task validation schema for creation
const taskCreationSchema = Joi.object({
  title: Joi.string().min(1).max(200).required(),
  description: Joi.string().allow('').max(5000),
  status: Joi.string().valid('todo', 'in_progress', 'in_review', 'completed'),
  priority: Joi.string().valid('low', 'medium', 'high'),
  team_id: Joi.number().integer().positive().required(),
  assigned_to: Joi.alternatives().try(
    Joi.number().integer().min(1),
    Joi.string().pattern(/^\d+$/), // Allow string representation of numbers
    Joi.valid(null)
  ).allow(null),
  due_date: Joi.date().iso().allow(null)
});

// Task validation schema for updates
const taskUpdateSchema = Joi.object({
  title: Joi.string().min(1).max(200),
  description: Joi.string().allow('').max(5000),
  status: Joi.string().valid('todo', 'in_progress', 'in_review', 'completed'),
  priority: Joi.string().valid('low', 'medium', 'high'),
  assigned_to: Joi.alternatives().try(
    Joi.number().integer().min(1),
    Joi.string().pattern(/^\d+$/), // Allow string representation of numbers
    Joi.valid(null)
  ).allow(null),
  due_date: Joi.date().iso().allow(null)
}).min(1); // At least one field must be provided for updates

// Task validation schema
const taskSchema = taskCreationSchema;

// Team validation schema
const teamSchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  description: Joi.string().max(500).allow('')
});

// Validate function generator
const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { convert: true }); // Enable type conversion
  if (error) {
    return res.status(400).json({
      error: 'Validation error',
      details: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }))
    });
  }
  next();
};

// Specific validation middleware
export const validateRegistration = validate(registrationSchema);
export const validateLogin = validate(loginSchema);
export const validateProfileUpdate = validate(profileUpdateSchema);
export const validatePasswordChange = validate(passwordChangeSchema);
export const validateTask = validate(taskCreationSchema);
export const validateTaskUpdate = validate(taskUpdateSchema);
export const validateTeam = validate(teamSchema);

// Query validation for filtering
export const validateTaskQuery = (req, res, next) => {
  const schema = Joi.object({
    team: Joi.number().integer().positive(),
    assignee: Joi.number().integer().positive(),
    userId: Joi.number().integer().positive(), // Allow userId parameter
    status: Joi.string().valid('todo', 'in_progress', 'in_review', 'completed'),
    priority: Joi.string().valid('low', 'medium', 'high'),
    limit: Joi.number().integer().min(1).max(100),
    offset: Joi.number().integer().min(0)
  });

  const { error } = schema.validate(req.query, { allowUnknown: true });
  if (error) {
    return res.status(400).json({
      error: 'Invalid query parameters',
      details: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }))
    });
  }
  next();
};