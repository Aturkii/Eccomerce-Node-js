export const deleteUnwantedHeaders = (req, res, next) => {
  const allowedHeaders = [
    "cache-control",
    "postman-token",
    "content-type",
    "content-length",
    "host",
    "user-agent",
    "accept",
    "accept-encoding",
    "connection",
    "token",
    "stripe-signature"
  ];

  Object.keys(req.headers).forEach((header) => {
    if (!allowedHeaders.includes(header.toLowerCase())) {
      delete req.headers[header];
    }
  });
  next();
};