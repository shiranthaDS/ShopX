import { useEffect, useMemo } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';

export default function OrderSuccess() {
  const location = useLocation();
  const navigate = useNavigate();

  const snapshot = useMemo(() => {
    if (location.state) return location.state;
    try {
      const raw = sessionStorage.getItem('shopx_last_order');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, [location.state]);

  useEffect(() => {
    // Clear snapshot after landing to avoid stale data buildup
    try { sessionStorage.removeItem('shopx_last_order'); } catch {}
  }, []);

  useEffect(() => {
    if (!snapshot?.capture) {
      navigate('/products', { replace: true });
    }
  }, [snapshot, navigate]);

  if (!snapshot?.capture) return null;

  const { capture, shipping, summary } = snapshot;
  const orderId = capture?.id || capture?.purchase_units?.[0]?.payments?.captures?.[0]?.id;
  const status = capture?.status || capture?.purchase_units?.[0]?.payments?.captures?.[0]?.status;
  const amount = capture?.purchase_units?.[0]?.payments?.captures?.[0]?.amount;
  const payer = capture?.payer;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-green-800 dark:border-green-900 dark:bg-green-950/40 dark:text-green-200">
        <h1 className="text-lg font-semibold">Thank you! Your order is confirmed.</h1>
        <p className="text-xs mt-1">We've emailed your receipt{payer?.email_address ? ` at ${payer.email_address}` : ''}. You can track the status in your account.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
          <h2 className="text-sm font-semibold">Order Details</h2>
          <div className="mt-2 text-xs space-y-2">
            <div className="flex justify-between"><span>Order ID</span><span className="font-mono">{orderId}</span></div>
            <div className="flex justify-between"><span>Status</span><span className="uppercase font-medium">{status}</span></div>
            {amount && (
              <div className="flex justify-between"><span>Paid</span><span className="font-medium">{amount.value} {amount.currency_code}</span></div>
            )}
            {payer?.name && (
              <div className="flex justify-between"><span>Payer</span><span>{[payer.name.given_name, payer.name.surname].filter(Boolean).join(' ')}</span></div>
            )}
            {payer?.email_address && (
              <div className="flex justify-between"><span>Email</span><span>{payer.email_address}</span></div>
            )}
          </div>
        </section>

        <section className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
          <h2 className="text-sm font-semibold">Shipping Address</h2>
          <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
            {shipping ? (
              <div className="space-y-1">
                <div>{shipping.fullName}</div>
                <div>{shipping.addressLine1}{shipping.addressLine2 ? ', ' + shipping.addressLine2 : ''}</div>
                <div>{shipping.city}{shipping.state ? ', ' + shipping.state : ''} {shipping.postalCode}</div>
                <div>{shipping.country}</div>
                {shipping.phone && <div>{shipping.phone}</div>}
              </div>
            ) : (
              <div>No shipping address provided.</div>
            )}
          </div>
        </section>
      </div>

      <section className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
        <h2 className="text-sm font-semibold">Order Summary</h2>
        <div className="mt-2 text-sm space-y-2">
          {summary?.cart?.items?.length > 0 ? (
            <ul className="divide-y divide-gray-200 dark:divide-gray-800">
              {summary.cart.items.map((it, idx) => (
                <li key={idx} className="py-2 flex items-center justify-between">
                  <div className="min-w-0">
                    <div className="truncate text-xs font-medium">{it?.product?.title || it?.title || 'Item'}</div>
                    <div className="text-[11px] text-gray-500">Qty {it?.quantity || 1}</div>
                  </div>
                  <div className="text-xs font-medium">
                    {(it?.total ?? ((it?.product?.price || it?.price || 0) * (it?.quantity || 1))).toFixed(2)} {summary?.currency || 'LKR'}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-xs text-gray-500">Items summary unavailable.</div>
          )}

          <div className="pt-2 border-t border-gray-200 dark:border-gray-800 space-y-1 text-sm">
            <div className="flex items-center justify-between"><span>Subtotal</span><span>{(summary?.cart?.subtotal || 0).toFixed(2)} {summary?.currency || 'LKR'}</span></div>
            <div className="flex items-center justify-between"><span>Shipping</span><span>{(summary?.shipping || 0).toFixed(2)} {summary?.currency || 'LKR'}</span></div>
            <div className="flex items-center justify-between"><span>Tax</span><span>{(summary?.tax || 0).toFixed(2)} {summary?.currency || 'LKR'}</span></div>
            <div className="flex items-center justify-between font-medium"><span>Total</span><span>{(summary?.total || 0).toFixed(2)} {summary?.currency || 'LKR'}</span></div>
          </div>
        </div>
      </section>

      <div className="flex items-center gap-3">
        <Link to="/products" className="text-sm underline">Continue shopping</Link>
        <Link to="/cart" className="text-sm underline">View cart</Link>
      </div>
    </div>
  );
}
