import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Checkout() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'LK'
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [saving, setSaving] = useState(false);

  const validate = (data) => {
    const v = {};
    if (!data.fullName.trim()) v.fullName = 'Required';
    if (!data.email.trim()) v.email = 'Required';
    else if (!/^[^@]+@[^@]+\.[^@]+$/.test(data.email)) v.email = 'Invalid email';
    if (!data.phone.trim()) v.phone = 'Required';
    if (!data.addressLine1.trim()) v.addressLine1 = 'Required';
    if (!data.city.trim()) v.city = 'Required';
    if (!data.postalCode.trim()) v.postalCode = 'Required';
    if (!data.country.trim()) v.country = 'Required';
    return v;
  };

  const onChange = (field, value) => {
    setForm(f => ({ ...f, [field]: value }));
    setErrors(validate({ ...form, [field]: value }));
  };

  const submit = (e) => {
    e.preventDefault();
    const v = validate(form);
    setErrors(v);
    setTouched(Object.keys(form).reduce((a, k) => ({ ...a, [k]: true }), {}));
    if (Object.keys(v).length) return;
    setSaving(true);
    try {
      localStorage.setItem('shopx_shipping', JSON.stringify(form));
      navigate('/payment');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-lg font-semibold mb-4">Shipping Details</h1>
      <form onSubmit={submit} className="space-y-5">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-xs font-medium mb-1">Full Name</label>
            <input className="w-full rounded-md border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 text-sm" value={form.fullName} onChange={(e)=>onChange('fullName', e.target.value)} onBlur={()=>setTouched(t=>({...t,fullName:true}))} />
            {touched.fullName && errors.fullName && <p className="mt-1 text-[11px] text-rose-600">{errors.fullName}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Email</label>
            <input type="email" className="w-full rounded-md border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 text-sm" value={form.email} onChange={(e)=>onChange('email', e.target.value)} onBlur={()=>setTouched(t=>({...t,email:true}))} />
            {touched.email && errors.email && <p className="mt-1 text-[11px] text-rose-600">{errors.email}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Phone</label>
            <input className="w-full rounded-md border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 text-sm" value={form.phone} onChange={(e)=>onChange('phone', e.target.value)} onBlur={()=>setTouched(t=>({...t,phone:true}))} />
            {touched.phone && errors.phone && <p className="mt-1 text-[11px] text-rose-600">{errors.phone}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Country</label>
            <select className="w-full rounded-md border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 text-sm" value={form.country} onChange={(e)=>onChange('country', e.target.value)} onBlur={()=>setTouched(t=>({...t,country:true}))} >
              <option value="LK">Sri Lanka</option>
              <option value="US">United States</option>
              <option value="GB">United Kingdom</option>
              <option value="AU">Australia</option>
            </select>
            {touched.country && errors.country && <p className="mt-1 text-[11px] text-rose-600">{errors.country}</p>}
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Address Line 1</label>
          <input className="w-full rounded-md border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 text-sm" value={form.addressLine1} onChange={(e)=>onChange('addressLine1', e.target.value)} onBlur={()=>setTouched(t=>({...t,addressLine1:true}))} />
            {touched.addressLine1 && errors.addressLine1 && <p className="mt-1 text-[11px] text-rose-600">{errors.addressLine1}</p>}
        </div>
        <div>
          <label className="block text-xs font-medium mb-1">Address Line 2 (Optional)</label>
          <input className="w-full rounded-md border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 text-sm" value={form.addressLine2} onChange={(e)=>onChange('addressLine2', e.target.value)} />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="block text-xs font-medium mb-1">City</label>
            <input className="w-full rounded-md border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 text-sm" value={form.city} onChange={(e)=>onChange('city', e.target.value)} onBlur={()=>setTouched(t=>({...t,city:true}))} />
            {touched.city && errors.city && <p className="mt-1 text-[11px] text-rose-600">{errors.city}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">State / Province</label>
            <input className="w-full rounded-md border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 text-sm" value={form.state} onChange={(e)=>onChange('state', e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Postal Code</label>
            <input className="w-full rounded-md border border-gray-200 dark:border-gray-700 bg-transparent px-3 py-2 text-sm" value={form.postalCode} onChange={(e)=>onChange('postalCode', e.target.value)} onBlur={()=>setTouched(t=>({...t,postalCode:true}))} />
            {touched.postalCode && errors.postalCode && <p className="mt-1 text-[11px] text-rose-600">{errors.postalCode}</p>}
          </div>
        </div>
        <div className="flex items-center justify-between">
          <button type="button" onClick={()=>navigate('/cart')} className="text-xs underline">Back to cart</button>
          <button disabled={saving || Object.keys(errors).length>0} className="rounded-md px-5 py-2 text-sm bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed">Continue to Payment</button>
        </div>
      </form>
      <p className="mt-6 text-[11px] text-gray-500">Your details are used only to fulfill this order.</p>
    </div>
  );
}
