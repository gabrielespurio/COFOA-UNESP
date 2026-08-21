const ASAAS_API_URL = process.env.ASAAS_ENV === 'sandbox' 
  ? 'https://sandbox.asaas.com/api/v3'
  : 'https://api.asaas.com/v3';

const headers = {
  'Content-Type': 'application/json',
  'access_token': process.env.ASAAS_API_KEY || ''
};

export interface AsaasCustomer {
  id: string;
  name: string;
  cpfCnpj: string;
  email: string;
}

export interface AsaasPayment {
  id: string;
  customer: string;
  value: number;
  netValue: number;
  billingType: string;
  status: string;
  dueDate: string;
  invoiceUrl: string;
}

export async function createOrGetCustomer(name: string, cpf: string, email: string, phone?: string | null): Promise<AsaasCustomer> {
  // Check if customer already exists by CPF
  const searchRes = await fetch(`${ASAAS_API_URL}/customers?cpfCnpj=${cpf}`, {
    method: 'GET',
    headers
  });
  const searchData = await searchRes.json();

  if (searchData.data && searchData.data.length > 0) {
    return searchData.data[0];
  }

  // Create new customer
  const createRes = await fetch(`${ASAAS_API_URL}/customers`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      name,
      cpfCnpj: cpf,
      email,
      mobilePhone: phone || undefined,
      notificationDisabled: false,
    })
  });

  if (!createRes.ok) {
    const errorData = await createRes.json();
    console.error('Error creating Asaas customer:', errorData);
    throw new Error('Falha ao registrar cliente no gateway de pagamento.');
  }

  return await createRes.json();
}

export async function createPayment(
  customerId: string, 
  amountInCents: number, 
  description: string, 
  dueDateStr: string
): Promise<AsaasPayment> {
  const value = amountInCents / 100; // Asaas expects float values for BRL

  const createRes = await fetch(`${ASAAS_API_URL}/payments`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      customer: customerId,
      billingType: 'UNDEFINED', // Let user choose between PIX, BOLETO, CREDIT_CARD on the hosted checkout
      value: value,
      dueDate: dueDateStr,
      description: description,
    })
  });

  if (!createRes.ok) {
    const errorData = await createRes.json();
    console.error('Error creating Asaas payment:', errorData);
    throw new Error('Falha ao gerar cobrança no gateway de pagamento.');
  }

  return await createRes.json();
}
