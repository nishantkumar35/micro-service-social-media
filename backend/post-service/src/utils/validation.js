const Joi = require("joi");

const validateCreatePost = (data) => {
  const schema = Joi.object({
    content: Joi.string().allow("").max(5000).optional(),
    mediaIds: Joi.array().items(Joi.string()).optional(),
  });

  return schema.validate(data);
};

module.exports = { validateCreatePost };