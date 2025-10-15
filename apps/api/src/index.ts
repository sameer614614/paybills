import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { z } from 'zod';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const healthResponse = {
  service: 'paybills-api',
  status: 'ok',
  version: '0.1.0'
};

app.get('/health', (_req, res) => {
  res.json(healthResponse);
});

const zipSchema = z.object({
  zip: z
    .string()
    .regex(/^\d{5}$/i, 'ZIP must be 5 digits')
});

type Provider = {
  name: string;
  category: 'Internet' | 'Home' | 'TV' | 'Electric' | 'Mobile';
  phone: string;
};

const providers: Provider[] = [
  { name: 'Spectrum', category: 'Internet', phone: '1-800-555-0115' },
  { name: 'BrightSource', category: 'Electric', phone: '1-800-555-0174' },
  { name: 'DirecTV', category: 'TV', phone: '1-800-555-0188' }
];

app.post('/public/providers/search', (req, res) => {
  const result = zipSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(422).json({ errors: result.error.flatten().fieldErrors });
  }

  const matches = providers.map((provider) => ({
    ...provider,
    discount: '25% off your first year when enrolled by phone'
  }));

  res.json({ zip: result.data.zip, providers: matches });
});

const port = Number(process.env.PORT ?? 4000);

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`API running on port ${port}`);
});
