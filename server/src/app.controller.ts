import { Request, Response } from 'express';

import { envConfig } from './config/env';

export function getRoot(req: Request, res: Response) {
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${envConfig.appName} API</title>
    <style>
      body { font-family: system-ui, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; background: #0a0a0a; color: #fafafa; }
      h1 { color: #ef4444; }
      p { line-height: 1.6; color: #a1a1aa; }
    </style>
</head>
<body>
    <h1>Hey! What are you doing here?</h1>
    <p>This is an API server. You shouldn't be here.</p>
    <p>You probably want to go to <a href="${envConfig.appUrl}">${envConfig.appUrl}</a></p>
    <p>Or <a href="https://github.com/muhsin7majeed/kadha">https://github.com/muhsin7majeed/kadha</a></p>
    <p>Or</p>
    <p>Go watch a movie or something.</p>
    <p>Seriously, there's nothing for you here.</p>
    <p>No buttons. No forms. No pretty pictures.</p>
    <p>Just cold, heartless JSON responses.</p>
    <p>If you keep poking around, the API will get angry.</p>
    <p>An angry API sends 500 errors.</p>
    <p>500 errors crash your app.</p>
    <p>Crashed apps make users sad.</p>
    <p>Sad users leave bad reviews.</p>
    <p>Bad reviews tank your ratings.</p>
    <p>And then you'll have nothing to watch.</p>
    <p><strong>Go use the actual app. Shoo.</strong></p>
</body>
</html>
  `);
}

export function getHealth(req: Request, res: Response) {
  res.status(200).json({ status: 'healthy', version: envConfig.version });
}
