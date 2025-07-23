export const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body);

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  // On stocke les données validées dans req.validatedBody
  req.validatedBody = value;
  next();
};
