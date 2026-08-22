const ASAAS_API_URL = process.env.ASAAS_ENV === 'sandbox' 
  ? 'https://sandbox.asaas.com/api/v3'
  : 'https://api.asaas.com/v3';

const getHeaders = () => {
  return {
    'Content-Type': 'application/json',
    'access_token': process.env.ASAAS_API_KEY || ''
  };
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
  const searchRes = await fetch(`${ASAAS_API_URL}/customers?cpfCnpj=${cpf}`, {
    method: 'GET',
    headers: getHeaders()
  });
  
  const searchRaw = await searchRes.text();
  let searchData;
  try {
    searchData = JSON.parse(searchRaw);
  } catch(e) {
    throw new Error(`Asaas GET Customer Error: Invalid JSON. Status: ${searchRes.status}. Body: ${searchRaw}`);
  }

  if (searchRes.ok && searchData.data && searchData.data.length > 0) {
    return searchData.data[0];
  }

  const createRes = await fetch(`${ASAAS_API_URL}/customers`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      name,
      cpfCnpj: cpf,
      email,
      mobilePhone: phone || undefined,
      notificationDisabled: false,
    })
  });

  const createRaw = await createRes.text();
  let createData;
  try {
    createData = JSON.parse(createRaw);
  } catch (e) {
    throw new Error(`Asaas POST Customer Error: Invalid JSON. Status: ${createRes.status}. Body: ${createRaw}`);
  }

  if (!createRes.ok) {
    console.error('Error creating Asaas customer:', createData);
    throw new Error(`Asaas Customer Error: ${JSON.stringify(createData)}`);
  }

  return createData;
}

export async function createPayment(
  customerId: string, 
  amountInCents: number, 
  description: string, 
  dueDateStr: string
): Promise<AsaasPayment> {
  const value = amountInCents / 100; 

  const createRes = await fetch(`${ASAAS_API_URL}/payments`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      customer: customerId,
      billingType: 'UNDEFINED',
      value: value,
      dueDate: dueDateStr,
      description: description,
    })
  });

  const createRaw = await createRes.text();
  let createData;
  try {
    createData = JSON.parse(createRaw);
  } catch (e) {
    throw new Error(`Asaas POST Payment Error: Invalid JSON. Status: ${createRes.status}. Body: ${createRaw}`);
  }

  if (!createRes.ok) {
    console.error('Error creating Asaas payment:', createData);
    throw new Error(`Asaas Payment Error: ${JSON.stringify(createData)}`);
  }

  return createData;
}
