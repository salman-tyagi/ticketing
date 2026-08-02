import { app } from './app';

export function startServer() {
  const PORT = 3000;

  const server = app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
  });

  return server;
}
