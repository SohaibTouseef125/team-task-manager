// middleware/proxy.js
// Middleware to handle proxy headers for Railway/Vercel deployments
export const proxyMiddleware = (req, res, next) => {
  // Trust proxy headers when deployed to Railway/Vercel
  // This ensures that the secure flag works properly behind reverse proxies
  if (process.env.NODE_ENV === 'production') {
    // Express automatically handles proxy headers when trust proxy is set
    // For Railway/Vercel deployments, we need to trust the first proxy
    req.app.set('trust proxy', 1);
  } else {
    // For development, trust local proxy
    req.app.set('trust proxy', 'loopback');
  }

  next();
};