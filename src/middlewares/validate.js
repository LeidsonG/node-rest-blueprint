/**
 * Middleware de validação baseado em Zod.
 *
 * Uso:
 *   router.post('/x', validate({ body: bodySchema, query: querySchema, params: paramsSchema }), handler)
 *
 * Cada chave é opcional; só as fornecidas são validadas.
 * Os dados validados/coerced substituem o original em req[key].
 */
function validate(schemas) {
  return (req, res, next) => {
    try {
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }
      if (schemas.query) {
        req.query = schemas.query.parse(req.query);
      }
      if (schemas.params) {
        req.params = schemas.params.parse(req.params);
      }
      return next();
    } catch (err) {
      return next(err);
    }
  };
}

module.exports = validate;
