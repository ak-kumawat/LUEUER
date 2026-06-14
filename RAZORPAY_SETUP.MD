# Razorpay Integration Setup Guide

This guide explains how to set up Razorpay payment integration for your KadamLabs application.

## Step 1: Get Razorpay Credentials

1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Sign up or log in to your account
3. Go to **Settings** → **API Keys**
4. Generate **Key ID** and **Key Secret**
   - For testing: Use **Test Mode** keys
   - For production: Use **Live Mode** keys

## Step 2: Add Environment Variables

Add these variables to your `.env.local` file:

```env
# Razorpay Credentials
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_secret_key_here
```

**Important Notes:**
- `NEXT_PUBLIC_RAZORPAY_KEY_ID` - This is public and safe to expose in client-side code
- `RAZORPAY_KEY_SECRET` - This is SECRET and must NEVER be exposed. Only used in server-side API routes.

## Step 3: API Routes Created

The following API routes have been created:

### 1. `/api/razorpay/create-order` (POST)
- Creates a Razorpay order
- Returns order ID and amount
- **Usage:** Called when user clicks "Pay Now"

### 2. `/api/razorpay/verify-payment` (POST)
- Verifies payment signature
- Ensures payment is legitimate
- **Usage:** Can be used for additional verification

### 3. `/api/razorpay/payment-success` (POST)
- Handles successful payment
- Creates order in database
- Updates payment status to "paid"
- **Usage:** Called after successful payment

## Step 4: How It Works

### Payment Flow:

1. **User selects payment method** → Chooses "Pay Online" (Razorpay)
2. **User clicks "Pay Now"** → Frontend calls `/api/razorpay/create-order`
3. **Razorpay checkout opens** → User enters payment details
4. **Payment successful** → Razorpay calls handler function
5. **Verify & Create Order** → Frontend calls `/api/razorpay/payment-success`
6. **Order created** → User redirected to orders page

### Cash on Delivery Flow:

1. **User selects "Cash on Delivery"**
2. **User clicks "Proceed to Checkout"**
3. **Order created directly** → Payment status: "pending"
4. **User redirected** → Orders page

## Step 5: Testing

### Test Mode:
- Use test credentials from Razorpay dashboard
- Use test card numbers:
  - **Success:** 4111 1111 1111 1111
  - **Failure:** 4000 0000 0000 0002
  - **CVV:** Any 3 digits
  - **Expiry:** Any future date

### Production Mode:
- Switch to live credentials
- Real payments will be processed

## Security Notes

✅ **DO:**
- Keep `RAZORPAY_KEY_SECRET` in `.env.local` (never commit to git)
- Always verify payment signature on server
- Use HTTPS in production

❌ **DON'T:**
- Never expose `RAZORPAY_KEY_SECRET` in client-side code
- Never skip payment verification
- Never trust client-side payment data alone

## Troubleshooting

### Payment not working?
1. Check if environment variables are set correctly
2. Verify Razorpay keys are active in dashboard
3. Check browser console for errors
4. Ensure Razorpay script is loaded

### Order not created after payment?
1. Check server logs for errors
2. Verify payment signature verification
3. Check database connection
4. Ensure cart items exist

## Support

For Razorpay API documentation, visit:
- [Razorpay Docs](https://razorpay.com/docs/)
- [Razorpay Checkout Integration](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/)

