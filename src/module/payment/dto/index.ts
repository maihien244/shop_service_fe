export type PaymentDto = {
  operation: 'PURCHASE',
  payment_method: 'CARD' | 'BANK_TRANSFER' | 'NAPAS_BANK_TRANSFER',
  merchant: string,
  order_invoice_number: string,
  order_amount: number,
  currency: string,
  order_description?: string,
  customer_id?: string,
  success_url?: string,
  error_url?: string,
  cancel_url?: string,
  custom_data?: string,
  signature?: string
}