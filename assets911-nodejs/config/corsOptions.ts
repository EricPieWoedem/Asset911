const allowedOrigins = ['http://localhost:3000', 'http://localhost:3002'];

if (process.env.NODE_ENV === 'production') {
  allowedOrigins.push('https://asset911.com', 'http://139.99.8.218:8090');
} else {
  allowedOrigins.push('http://localhost:3000', 'http://localhost:3002');
}

const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (allowedOrigins.indexOf(origin ?? '') !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  optionsSuccessStatus: 200,
};

export { corsOptions, allowedOrigins };
