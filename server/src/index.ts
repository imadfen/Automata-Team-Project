import express, { Express, Request, Response } from 'express';

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.send('Automata Team Project API');
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});