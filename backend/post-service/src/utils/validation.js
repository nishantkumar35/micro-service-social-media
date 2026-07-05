const Joi = require("joi");

const validateCreatePost = (data) => {
  const schema = Joi.object({
    content: Joi.string().allow("").max(5000).optional(),
    mediaIds: Joi.array().items(Joi.string()).optional(),
  });

  return schema.validate(data);
};

const validateComment = (data) => {
  const schema = Joi.object({
    content: Joi.string().trim().min(1).max(500).required().messages({
      "string.empty": "Comment content cannot be empty",
      "string.max": "Comment cannot exceed 500 characters",
    }),
  });
  return schema.validate(data);
};

module.exports = { validateCreatePost, validateComment };