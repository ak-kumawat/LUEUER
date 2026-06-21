import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

export const sendOrderConfirmationEmail = async (order, userEmail) => {
  if (!resend) {
    console.log(`[Email Mock] Resend API key is not configured. Confirmation email not sent to ${userEmail} for order ${order.orderNumber}.`)
    return
  }

  const itemsHtml = order.items.map(item => `
    <tr style="border-bottom: 1px solid #27272a;">
      <td style="padding: 12px 0; color: #ffffff; font-size: 14px;">
        <div style="font-weight: 500;">${item.variant.product.name}</div>
        <div style="font-size: 12px; color: #a1a1aa; margin-top: 4px;">Size: ${item.variant.size} | Color: ${item.variant.color}</div>
      </td>
      <td style="padding: 12px 0; text-align: center; color: #a1a1aa; font-size: 14px;">${item.quantity}</td>
      <td style="padding: 12px 0; text-align: right; color: #ffffff; font-size: 14px; font-weight: 500;">₹${parseFloat(item.unitPrice).toLocaleString('en-IN')}</td>
    </tr>
  `).join('')

  const emailHtml = `
    <div style="background-color: #09090b; color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px 20px; max-width: 600px; margin: 0 auto; border: 1px solid #27272a; border-radius: 8px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="font-family: Georgia, serif; font-size: 32px; font-weight: 400; letter-spacing: 0.1em; margin: 0; color: #ffffff; text-transform: uppercase;">LUEUER</h1>
        <p style="font-size: 12px; color: #cca43b; letter-spacing: 0.2em; text-transform: uppercase; margin: 5px 0 0 0;">Signature Collection</p>
      </div>

      <div style="border-bottom: 1px solid #27272a; padding-bottom: 20px; margin-bottom: 25px;">
        <h2 style="font-size: 20px; font-weight: 400; margin: 0 0 10px 0; color: #ffffff; letter-spacing: 0.05em;">Order Confirmed</h2>
        <p style="font-size: 14px; color: #a1a1aa; margin: 0; line-height: 1.5;">Thank you for your purchase. We are preparing your order for shipment. Below are your order details and invoice.</p>
      </div>

      <div style="margin-bottom: 25px; display: flex; justify-content: space-between; font-size: 13px;">
        <div>
          <span style="color: #a1a1aa; display: block; margin-bottom: 4px;">Order Number</span>
          <strong style="color: #ffffff; font-size: 14px;">${order.orderNumber}</strong>
        </div>
        <div style="text-align: right;">
          <span style="color: #a1a1aa; display: block; margin-bottom: 4px;">Date</span>
          <strong style="color: #ffffff; font-size: 14px;">${new Date(order.placedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</strong>
        </div>
      </div>

      <div style="margin-bottom: 30px; background-color: #121214; padding: 15px; border-radius: 6px; border: 1px solid #27272a;">
        <h3 style="font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: #cca43b; margin: 0 0 10px 0;">Shipping Address</h3>
        <p style="font-size: 13px; color: #d4d4d8; margin: 0; line-height: 1.5;">
          ${order.shippingAddress.street}<br/>
          ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.postalCode}<br/>
          ${order.shippingAddress.country}
        </p>
      </div>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
        <thead>
          <tr style="border-bottom: 1px solid #27272a;">
            <th style="text-align: left; padding-bottom: 8px; color: #a1a1aa; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Product</th>
            <th style="text-align: center; padding-bottom: 8px; color: #a1a1aa; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Qty</th>
            <th style="text-align: right; padding-bottom: 8px; color: #a1a1aa; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <div style="border-top: 1px solid #27272a; padding-top: 15px; font-size: 14px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <span style="color: #a1a1aa;">Subtotal</span>
          <span style="color: #ffffff;">₹${parseFloat(order.subtotal).toLocaleString('en-IN')}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <span style="color: #a1a1aa;">Shipping</span>
          <span style="color: #ffffff;">${parseFloat(order.shippingFee) === 0 ? 'FREE' : `₹${parseFloat(order.shippingFee).toLocaleString('en-IN')}`}</span>
        </div>
        <div style="display: flex; justify-content: space-between; border-top: 1px solid #27272a; padding-top: 12px; margin-top: 12px; font-size: 16px; font-weight: 600;">
          <span style="color: #cca43b;">Total Paid</span>
          <span style="color: #ffffff;">₹${parseFloat(order.totalAmount).toLocaleString('en-IN')}</span>
        </div>
      </div>

      <div style="text-align: center; margin-top: 40px; border-top: 1px solid #27272a; padding-top: 20px; font-size: 12px; color: #71717a;">
        <p style="margin: 0 0 10px 0;">If you have any questions, reply to this email or contact us at <a href="mailto:support@lueuer.world" style="color: #cca43b; text-decoration: none;">support@lueuer.world</a></p>
        <p style="margin: 0;">&copy; ${new Date().getFullYear()} LUEUER. All rights reserved.</p>
      </div>
    </div>
  `

  try {
    const data = await resend.emails.send({
      from: 'LUEUER <orders@lueuer.world>',
      to: userEmail,
      subject: `Order Confirmed - ${order.orderNumber}`,
      html: emailHtml,
    })
    console.log(`[Email Success] Order confirmation sent: ${data.id}`)
    return data
  } catch (error) {
    console.error('[Email Error] Failed to send confirmation email:', error)
  }
}

export const sendOrderShippedEmail = async (order, trackingData, userEmail) => {
  if (!resend) {
    console.log(`[Email Mock] Resend API key is not configured. Shipping email not sent to ${userEmail} for order ${order.orderNumber}.`)
    return
  }

  const trackingLink = trackingData.awbCode 
    ? `https://shiprocket.co/tracking/${trackingData.awbCode}` 
    : 'https://shiprocket.co/tracking'

  const emailHtml = `
    <div style="background-color: #09090b; color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 40px 20px; max-width: 600px; margin: 0 auto; border: 1px solid #27272a; border-radius: 8px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="font-family: Georgia, serif; font-size: 32px; font-weight: 400; letter-spacing: 0.1em; margin: 0; color: #ffffff; text-transform: uppercase;">LUEUER</h1>
        <p style="font-size: 12px; color: #cca43b; letter-spacing: 0.2em; text-transform: uppercase; margin: 5px 0 0 0;">Signature Collection</p>
      </div>

      <div style="border-bottom: 1px solid #27272a; padding-bottom: 20px; margin-bottom: 25px;">
        <h2 style="font-size: 20px; font-weight: 400; margin: 0 0 10px 0; color: #ffffff; letter-spacing: 0.05em;">Order Shipped 🚚</h2>
        <p style="font-size: 14px; color: #a1a1aa; margin: 0; line-height: 1.5;">Exciting news! Your order has been processed and is now on its way to you.</p>
      </div>

      <div style="margin-bottom: 30px; background-color: #121214; padding: 20px; border-radius: 6px; border: 1px solid #27272a; text-align: center;">
        <p style="font-size: 13px; color: #a1a1aa; margin: 0 0 6px 0; text-transform: uppercase; letter-spacing: 0.1em;">Courier Partner</p>
        <h3 style="font-size: 18px; font-weight: 500; color: #ffffff; margin: 0 0 20px 0;">${trackingData.courierName || 'Shiprocket Partner'}</h3>
        
        <p style="font-size: 13px; color: #a1a1aa; margin: 0 0 6px 0; text-transform: uppercase; letter-spacing: 0.1em;">Tracking Number (AWB)</p>
        <h3 style="font-size: 18px; font-weight: 600; color: #cca43b; margin: 0 0 24px 0; letter-spacing: 0.05em;">${trackingData.awbCode || '—'}</h3>

        <a href="${trackingLink}" target="_blank" style="display: inline-block; background-color: #ffffff; color: #000000; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; padding: 12px 28px; text-decoration: none; border-radius: 4px; transition: background 0.2s ease;">
          Track Shipment
        </a>
      </div>

      <div style="margin-bottom: 25px; display: flex; justify-content: space-between; font-size: 13px;">
        <div>
          <span style="color: #a1a1aa; display: block; margin-bottom: 4px;">Order Number</span>
          <strong style="color: #ffffff;">${order.orderNumber}</strong>
        </div>
        <div style="text-align: right;">
          <span style="color: #a1a1aa; display: block; margin-bottom: 4px;">Delivery Address</span>
          <strong style="color: #ffffff;">${order.shippingAddress.city}, ${order.shippingAddress.state}</strong>
        </div>
      </div>

      <div style="text-align: center; margin-top: 40px; border-top: 1px solid #27272a; padding-top: 20px; font-size: 12px; color: #71717a;">
        <p style="margin: 0 0 10px 0;">If you have any questions, reply to this email or contact us at <a href="mailto:support@lueuer.world" style="color: #cca43b; text-decoration: none;">support@lueuer.world</a></p>
        <p style="margin: 0;">&copy; ${new Date().getFullYear()} LUEUER. All rights reserved.</p>
      </div>
    </div>
  `

  try {
    const data = await resend.emails.send({
      from: 'LUEUER <orders@lueuer.world>',
      to: userEmail,
      subject: `Your LUEUER Order has Shipped - ${order.orderNumber}`,
      html: emailHtml,
    })
    console.log(`[Email Success] Shipping email sent: ${data.id}`)
    return data
  } catch (error) {
    console.error('[Email Error] Failed to send shipping email:', error)
  }
}
