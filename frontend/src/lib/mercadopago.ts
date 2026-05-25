import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';

// Instanciar o client do Mercado Pago com o Access Token
// É crucial que o token esteja no arquivo .env.local e nunca prefixado com NEXT_PUBLIC
const client = new MercadoPagoConfig({ 
  accessToken: process.env.MP_ACCESS_TOKEN || '' 
});

export const preference = new Preference(client);
export const payment = new Payment(client);
