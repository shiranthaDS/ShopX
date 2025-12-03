import mongoose from 'mongoose';

const ItemSchema = new mongoose.Schema({
  productId: String,
  title: String,
  price: Number,
  quantity: Number,
  total: Number,
  imageUrl: String,
}, { _id: false });

const ShippingSchema = new mongoose.Schema({
  fullName: String,
  email: String,
  phone: String,
  addressLine1: String,
  addressLine2: String,
  city: String,
  state: String,
  postalCode: String,
  country: String,
}, { _id: false });

const PayerSchema = new mongoose.Schema({
  email: String,
  name: {
    given_name: String,
    surname: String,
  },
  payer_id: String,
}, { _id: false });

const CaptureSchema = new mongoose.Schema({
  id: String,
  status: String,
  amount: {
    currency_code: String,
    value: String,
  },
}, { _id: false });

const OrderSchema = new mongoose.Schema({
  orderId: { type: String, index: true },
  status: String,
  currency: String,
  totalPaid: Number,
  payer: PayerSchema,
  shipping: ShippingSchema,
  items: [ItemSchema],
  cartSubtotal: Number,
  shippingFee: Number,
  tax: Number,
  cartTotalLocal: Number,
  localCurrency: String,
  fxRate: Number,
  deliveryStatus: { type: String, enum: ['awaiting_shipment', 'shipped', 'completed'], default: 'awaiting_shipment' },
  trackingNumber: { type: String },
  paypal: {
    id: String,
    status: String,
    capture: CaptureSchema,
    raw: Object,
  },
  userId: { type: String },
}, { timestamps: true });

export default mongoose.model('Order', OrderSchema);
