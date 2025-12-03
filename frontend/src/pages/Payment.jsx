import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cartApi } from '../lib/cartApi.js';

const PAYMENT_API_BASE = import.meta.env.VITE_PAYMENT_API_BASE || 'http://localhost:4004';

function loadPaypalScript(clientId, currency = 'USD') {
  return new Promise((resolve, reject) => {
    if (window.paypal) return resolve(window.paypal);
    const s = document.createElement('script');
    s.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=${currency}`;
    s.async = true;
    s.onload = () => resolve(window.paypal);
    s.onerror = reject;
    document.body.appendChild(s);
  });
}

export default function Payment() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [clientId, setClientId] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [localCurrency, setLocalCurrency] = useState('LKR');
  const [fxRate, setFxRate] = useState(0);
  const buttonsRef = useRef(null);
  const renderedRef = useRef(false);
  const buttonsInstanceRef = useRef(null);
  const [shipping, setShipping] = useState(null);

  useEffect(() => {
    const raw = localStorage.getItem('shopx_shipping');
    if (!raw) {
      navigate('/checkout');
      return;
    }
    try { setShipping(JSON.parse(raw)); } catch { navigate('/checkout'); }
  }, [navigate]);

  useEffect(() => {
    if (!shipping) return;
    const init = async () => {
      setLoading(true);
      try {
        const s = await cartApi.checkout();
        setSummary(s);
        const cfgRes = await fetch(`${PAYMENT_API_BASE}/api/paypal/config`, { credentials: 'include' });
        if (!cfgRes.ok) throw new Error(`Config failed: ${cfgRes.status}`);
        const cfg = await cfgRes.json();
        if (!cfg.clientId) throw new Error('Missing PayPal clientId');
        setClientId(cfg.clientId);
        setCurrency((cfg.currency || 'USD').toUpperCase());
        if (cfg.localCurrency) setLocalCurrency(cfg.localCurrency);
        if (typeof cfg.fxRate === 'number') setFxRate(cfg.fxRate);
      } catch (e) {
        setError(e.message || 'Failed to load');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [shipping]);

  useEffect(() => {
    const mountButtons = async () => {
      if (!clientId || !summary?.total || !buttonsRef.current || !shipping) return;
      if (renderedRef.current) return;
      try {
        await loadPaypalScript(clientId, currency);
        const paypal = window.paypal;
        buttonsRef.current.innerHTML = '';
        const buttons = paypal.Buttons({
          style: { layout: 'vertical', color: 'gold', shape: 'rect', label: 'paypal' },
          createOrder: async () => {
            const res = await fetch(`${PAYMENT_API_BASE}/api/paypal/create-order`, {
              method: 'POST',
              credentials: 'include',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ shipping })
            });
            if (!res.ok) {
              let msg = `Failed to create order (${res.status})`;
              try { const j = await res.json(); if (j?.error) msg = j.error; } catch {}
              throw new Error(msg);
            }
            const data = await res.json();
            return data.id;
          },
          onApprove: async (data) => {
            const res = await fetch(`${PAYMENT_API_BASE}/api/paypal/capture-order`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({ orderID: data.orderID, shipping })
            });
            if (!res.ok) {
              let msg = `Payment capture failed (${res.status})`;
              try { const j = await res.json(); if (j?.error) msg = j.error; } catch {}
              throw new Error(msg);
            }
            const capture = await res.json();
            try {
              sessionStorage.setItem('shopx_last_order', JSON.stringify({ capture, shipping, summary }));
            } catch {}
            localStorage.removeItem('shopx_shipping');
            navigate('/order-success', { state: { capture, shipping, summary } });
          },
          onError: (err) => {
            console.error(err);
            alert(err?.message || 'Payment failed. Please try again.');
          }
        });
        buttonsInstanceRef.current = buttons;
        await buttons.render(buttonsRef.current);
        renderedRef.current = true;
      } catch (e) {
        console.error(e);
        setError(e.message || 'Failed to initialize PayPal');
      }
    };
    mountButtons();
    return () => {
      renderedRef.current = false;
      try { buttonsInstanceRef.current?.close?.(); } catch {}
      if (buttonsRef.current) buttonsRef.current.innerHTML = '';
    };
  }, [clientId, summary, currency, shipping, navigate]);

  if (!shipping) return null;
  if (loading) return <div className="text-sm text-gray-500">Loading payment…</div>;
  if (error) return <div className="text-sm text-rose-600">{error}</div>;

  return (
    <div className="mx-auto max-w-6xl grid gap-6 lg:grid-cols-12">
      <aside className="lg:col-span-5 space-y-3 order-2 lg:order-1">
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
          <h2 className="text-sm font-semibold">Order Summary</h2>
          <div className="mt-2 space-y-2 text-sm">
            <div className="flex items-center justify-between"><span>Subtotal</span><span>{(summary?.cart?.subtotal || 0).toFixed(2)} {localCurrency}</span></div>
            <div className="flex items-center justify-between"><span>Shipping</span><span>{(summary?.shipping || 0).toFixed(2)} {localCurrency}</span></div>
            <div className="flex items-center justify-between"><span>Tax</span><span>{(summary?.tax || 0).toFixed(2)} {localCurrency}</span></div>
            <div className="border-t border-gray-200 dark:border-gray-800 pt-2 flex items-center justify-between font-medium"><span>Total</span><span>{(summary?.total || 0).toFixed(2)} {localCurrency}</span></div>
            {fxRate > 0 && (
              <div className="text-[11px] text-gray-500">Approx. {(Number(summary?.total || 0) * fxRate).toFixed(2)} {currency}</div>
            )}
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
          <h2 className="text-sm font-semibold">Shipping</h2>
          <div className="mt-2 space-y-1 text-xs text-gray-600 dark:text-gray-400">
            <div>{shipping.fullName}</div>
            <div>{shipping.addressLine1}{shipping.addressLine2 ? ', ' + shipping.addressLine2 : ''}</div>
            <div>{shipping.city}{shipping.state ? ', ' + shipping.state : ''} {shipping.postalCode}</div>
            <div>{shipping.country}</div>
            <div>{shipping.email}</div>
            <div>{shipping.phone}</div>
            <button type="button" onClick={()=>navigate('/checkout')} className="mt-2 text-[11px] underline">Edit shipping</button>
          </div>
        </div>
      </aside>
      <div className="lg:col-span-7 order-1 lg:order-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
        <h1 className="text-lg font-semibold">Payment</h1>
        <p className="mt-1 text-xs text-gray-500">Pay securely with PayPal.</p>
        <div className="mt-4 rounded-lg border border-gray-200 dark:border-gray-800 p-4 bg-gray-50 dark:bg-gray-800/40">
          <div ref={buttonsRef} />
        </div>
        <button className="mt-4 text-xs underline" onClick={() => navigate('/checkout')}>Back to shipping</button>
      </div>
    </div>
  );
}
