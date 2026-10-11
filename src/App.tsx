import { useEffect, useMemo, useState } from 'react';
import { MEDICINES_DATABASE } from './utils/medicines';

type Tab = 'Dashboard' | 'Products' | 'Suppliers' | 'Customers' | 'Purchases' | 'Sales' | 'Returns' | 'Accounting' | 'Reports';

type Product = {
  id: string;
  name: string;
  category: string;
  packing: string;
  code: string;
  rack: string;
  createdAt: string;
};

type Supplier = {
  id: string;
  name: string;
  contact: string;
  phone: string;
  address: string;
  createdAt: string;
};

type Customer = {
  id: string;
  name: string;
  phone: string;
  address: string;
  createdAt: string;
};

type PurchaseEntry = {
  id: string;
  date: string;
  nepaliDate: string;
  supplierId: string;
  productId: string;
  batch: string;
  expiry: string;
  quantity: number;
  purchasePrice: number;
  sellingPrice: number;
  discountType: 'percent' | 'amount';
  discountValue: number;
  dueDays: 30 | 60 | 90 | 120;
  dueDate: string;
  createdAt: string;
};

type SaleEntry = {
  id: string;
  date: string;
  nepaliDate: string;
  customerId: string;
  productId: string;
  quantity: number;
  sellingPrice: number;
  discountType: 'percent' | 'amount';
  discountValue: number;
  paid: number;
  createdAt: string;
};

type SaleReturnEntry = {
  id: string;
  date: string;
  nepaliDate: string;
  saleId: string;
  reason: string;
  quantity: number;
  createdAt: string;
};

type ExpenseEntry = {
  id: string;
  date: string;
  nepaliDate: string;
  category: string;
  title: string;
  vendor: string;
  amount: number;
  note: string;
};

type IncomeEntry = {
  id: string;
  date: string;
  nepaliDate: string;
  category: string;
  title: string;
  source: string;
  amount: number;
  note: string;
};

type PaymentEntry = {
  id: string;
  date: string;
  nepaliDate: string;
  supplierId: string;
  amount: number;
  note: string;
};

type Store = {
  products: Product[];
  suppliers: Supplier[];
  customers: Customer[];
  purchases: PurchaseEntry[];
  sales: SaleEntry[];
  saleReturns: SaleReturnEntry[];
  expenses: ExpenseEntry[];
  incomes: IncomeEntry[];
  payments: PaymentEntry[];
  expenseCategories: string[];
  incomeCategories: string[];
};

type ReportRange = 'today' | 'yesterday' | 'thisWeek' | 'thisMonth' | 'lastMonth' | 'thisYear';

const todayStr = () => new Date().toISOString().slice(0, 10);
const nepaliToday = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const calcDueDate = (fromDate: string, days: number) => {
  const d = new Date(fromDate);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

const defaultStore: Store = {
  products: [],
  suppliers: [],
  customers: [],
  purchases: [],
  sales: [],
  saleReturns: [],
  expenses: [],
  incomes: [],
  payments: [],
  expenseCategories: ['Rent', 'Utilities', 'Staff', 'Transport', 'Maintenance', 'Other'],
  incomeCategories: ['Service', 'Commission', 'Interest', 'Other'],
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'NPR', minimumFractionDigits: 2 }).format(value);

const formatNumber = (value: number) => new Intl.NumberFormat('en-US').format(value);

const uniqueString = (prefix: string) => `${prefix}-${Date.now().toString().slice(-6)}-${Math.random().toString(36).slice(2, 6)}`;

const getRangeMatches = (dateValue: string, range: ReportRange) => {
  const target = new Date(dateValue);
  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  if (range === 'today') return target >= startOfToday && target <= new Date(startOfToday.getTime() + 86400000);

  if (range === 'yesterday') {
    const y = new Date(startOfToday);
    y.setDate(y.getDate() - 1);
    return target >= new Date(y.getFullYear(), y.getMonth(), y.getDate()) && target < startOfToday;
  }

  if (range === 'thisWeek') {
    const start = new Date(startOfToday);
    start.setDate(start.getDate() - 6);
    return target >= start && target <= new Date(startOfToday.getTime() + 86400000);
  }

  if (range === 'thisMonth') return target.getMonth() === today.getMonth() && target.getFullYear() === today.getFullYear();

  if (range === 'lastMonth') {
    const prev = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const next = new Date(today.getFullYear(), today.getMonth(), 1);
    return target >= prev && target < next;
  }

  if (range === 'thisYear') return target.getFullYear() === today.getFullYear();
  return true;
};

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('Dashboard');
  const [store, setStore] = useState<Store>(() => {
    const saved = localStorage.getItem('medical-accounting-store');
    if (saved) {
      try {
        return { ...defaultStore, ...JSON.parse(saved) } as Store;
      } catch {
        return defaultStore;
      }
    }
    return defaultStore;
  });

  const [productForm, setProductForm] = useState({ name: '', category: 'Tablet', packing: '', code: '', rack: '' });
  const [supplierForm, setSupplierForm] = useState({ name: '', contact: '', phone: '', address: '' });
  const [customerForm, setCustomerForm] = useState({ name: '', phone: '', address: '' });
  const [purchaseForm, setPurchaseForm] = useState({
    supplierId: '',
    productId: '',
    batch: '',
    expiry: '',
    quantity: '1',
    purchasePrice: '0',
    sellingPrice: '0',
    discountType: 'percent' as const,
    discountValue: '0',
    dueDays: '30' as const,
    date: todayStr(),
    nepaliDate: nepaliToday(),
  });

  const [saleForm, setSaleForm] = useState({
    customerId: '',
    productId: '',
    quantity: '1',
    sellingPrice: '0',
    discountType: 'percent' as const,
    discountValue: '0',
    paid: '0',
    date: todayStr(),
    nepaliDate: nepaliToday(),
  });

  const [saleReturnForm, setSaleReturnForm] = useState({ saleId: '', reason: '', quantity: '1' });
  const [expenseForm, setExpenseForm] = useState({ category: '', title: '', vendor: '', amount: '0', note: '', date: todayStr(), nepaliDate: nepaliToday() });
  const [incomeForm, setIncomeForm] = useState({ category: '', title: '', source: '', amount: '0', note: '', date: todayStr(), nepaliDate: nepaliToday() });
  const [paymentForm, setPaymentForm] = useState({ supplierId: '', amount: '0', note: '', date: todayStr(), nepaliDate: nepaliToday() });
  const [reportRange, setReportRange] = useState<ReportRange>('thisMonth');

  useEffect(() => {
    localStorage.setItem('medical-accounting-store', JSON.stringify(store));
  }, [store]);

  const inventoryByProduct = useMemo(() => {
    const result: Record<string, number> = {};
    for (const purchase of store.purchases) result[purchase.productId] = (result[purchase.productId] || 0) + purchase.quantity;
    for (const sale of store.sales) result[sale.productId] = (result[sale.productId] || 0) - sale.quantity;
    for (const ret of store.saleReturns) {
      const sale = store.sales.find((s) => s.id === ret.saleId);
      if (sale) result[sale.productId] = (result[sale.productId] || 0) + ret.quantity;
    }
    return result;
  }, [store.purchases, store.sales, store.saleReturns]);

  const summary = useMemo(() => {
    const totalSales = store.sales.reduce((sum, entry) => {
      const gross = entry.quantity * entry.sellingPrice;
      const discount = entry.discountType === 'percent' ? (gross * entry.discountValue) / 100 : entry.discountValue;
      return sum + (gross - discount);
    }, 0);

    const totalReturns = store.saleReturns.reduce((sum, ret) => {
      const sale = store.sales.find((s) => s.id === ret.saleId);
      if (!sale) return sum;
      const gross = ret.quantity * sale.sellingPrice;
      return sum + gross;
    }, 0);

    const totalPurchases = store.purchases.reduce((sum, entry) => sum + entry.quantity * entry.purchasePrice, 0);
    const totalExpenses = store.expenses.reduce((sum, entry) => sum + entry.amount, 0);
    const totalIncomes = store.incomes.reduce((sum, entry) => sum + entry.amount, 0);

    return {
      totalSales,
      totalReturns,
      totalPurchases,
      totalExpenses,
      totalIncomes,
      grossProfit: totalSales - totalPurchases,
      netProfit: totalSales - totalPurchases - totalExpenses + totalIncomes,
    };
  }, [store]);

  const autoCode = (category: string) => {
    const prefix = category.split(' ').map((word) => word.slice(0, 2).toUpperCase()).join('').slice(0, 4) || 'MED';
    const nextNum = store.products.length + 1;
    return `${prefix}-${String(nextNum).padStart(4, '0')}`;
  };

  const getProductName = (id: string) => store.products.find((item) => item.id === id)?.name || 'Unknown';
  const getSupplierName = (id: string) => store.suppliers.find((item) => item.id === id)?.name || 'Unknown';
  const getCustomerName = (id: string) => store.customers.find((item) => item.id === id)?.name || 'Unknown';

  const addProduct = () => {
    if (!productForm.name.trim()) return;
    const product: Product = {
      id: uniqueString('prod'),
      name: productForm.name.trim(),
      category: productForm.category,
      packing: productForm.packing || 'N/A',
      code: productForm.code || autoCode(productForm.category),
      rack: productForm.rack || 'A-01',
      createdAt: new Date().toISOString(),
    };
    setStore((prev) => ({ ...prev, products: [product, ...prev.products] }));
    setProductForm({ name: '', category: 'Tablet', packing: '', code: '', rack: '' });
  };

  const addSupplier = () => {
    if (!supplierForm.name.trim()) return;
    const supplier: Supplier = {
      id: uniqueString('sup'),
      name: supplierForm.name.trim(),
      contact: supplierForm.contact,
      phone: supplierForm.phone,
      address: supplierForm.address,
      createdAt: new Date().toISOString(),
    };
    setStore((prev) => ({ ...prev, suppliers: [supplier, ...prev.suppliers] }));
    setSupplierForm({ name: '', contact: '', phone: '', address: '' });
    setActiveTab('Suppliers');
  };

  const addCustomer = () => {
    if (!customerForm.name.trim()) return;
    const customer: Customer = {
      id: uniqueString('cus'),
      name: customerForm.name.trim(),
      phone: customerForm.phone,
      address: customerForm.address,
      createdAt: new Date().toISOString(),
    };
    setStore((prev) => ({ ...prev, customers: [customer, ...prev.customers] }));
    setCustomerForm({ name: '', phone: '', address: '' });
    setActiveTab('Customers');
  };

  const addPurchase = () => {
    if (!purchaseForm.supplierId || !purchaseForm.productId) return;
    const dueDate = calcDueDate(purchaseForm.date, Number(purchaseForm.dueDays));
    const entry: PurchaseEntry = {
      id: uniqueString('pur'),
      date: purchaseForm.date,
      nepaliDate: purchaseForm.nepaliDate,
      supplierId: purchaseForm.supplierId,
      productId: purchaseForm.productId,
      batch: purchaseForm.batch || 'AUTO-BATCH',
      expiry: purchaseForm.expiry || 'N/A',
      quantity: Number(purchaseForm.quantity || 0),
      purchasePrice: Number(purchaseForm.purchasePrice || 0),
      sellingPrice: Number(purchaseForm.sellingPrice || 0),
      discountType: purchaseForm.discountType,
      discountValue: Number(purchaseForm.discountValue || 0),
      dueDays: Number(purchaseForm.dueDays) as 30 | 60 | 90 | 120,
      dueDate,
      createdAt: new Date().toISOString(),
    };
    setStore((prev) => ({ ...prev, purchases: [entry, ...prev.purchases] }));
    setPurchaseForm({
      supplierId: '',
      productId: '',
      batch: '',
      expiry: '',
      quantity: '1',
      purchasePrice: '0',
      sellingPrice: '0',
      discountType: 'percent',
      discountValue: '0',
      dueDays: '30',
      date: todayStr(),
      nepaliDate: nepaliToday(),
    });
    setActiveTab('Purchases');
  };

  const addSale = () => {
    if (!saleForm.customerId || !saleForm.productId) return;
    const qty = Number(saleForm.quantity || 0);
    const stock = inventoryByProduct[saleForm.productId] || 0;
    if (qty > stock) {
      alert('Stock not available for this sale.');
      return;
    }
    const entry: SaleEntry = {
      id: uniqueString('sal'),
      date: saleForm.date,
      nepaliDate: saleForm.nepaliDate,
      customerId: saleForm.customerId,
      productId: saleForm.productId,
      quantity: qty,
      sellingPrice: Number(saleForm.sellingPrice || 0),
      discountType: saleForm.discountType,
      discountValue: Number(saleForm.discountValue || 0),
      paid: Number(saleForm.paid || 0),
      createdAt: new Date().toISOString(),
    };
    setStore((prev) => ({ ...prev, sales: [entry, ...prev.sales] }));
    setSaleForm({
      customerId: '',
      productId: '',
      quantity: '1',
      sellingPrice: '0',
      discountType: 'percent',
      discountValue: '0',
      paid: '0',
      date: todayStr(),
      nepaliDate: nepaliToday(),
    });
    setActiveTab('Sales');
  };

  const addSaleReturn = () => {
    if (!saleReturnForm.saleId || !saleReturnForm.reason) return;
    const entry: SaleReturnEntry = {
      id: uniqueString('ret'),
      date: todayStr(),
      nepaliDate: nepaliToday(),
      saleId: saleReturnForm.saleId,
      reason: saleReturnForm.reason,
      quantity: Number(saleReturnForm.quantity || 1),
      createdAt: new Date().toISOString(),
    };
    setStore((prev) => ({ ...prev, saleReturns: [entry, ...prev.saleReturns] }));
    setSaleReturnForm({ saleId: '', reason: '', quantity: '1' });
    setActiveTab('Returns');
  };

  const addExpense = () => {
    if (!expenseForm.title.trim() || !expenseForm.category.trim()) return;
    const entry: ExpenseEntry = {
      id: uniqueString('exp'),
      date: expenseForm.date,
      nepaliDate: expenseForm.nepaliDate,
      category: expenseForm.category,
      title: expenseForm.title,
      vendor: expenseForm.vendor,
      amount: Number(expenseForm.amount || 0),
      note: expenseForm.note,
    };
    setStore((prev) => ({
      ...prev,
      expenses: [entry, ...prev.expenses],
      expenseCategories: prev.expenseCategories.includes(expenseForm.category) ? prev.expenseCategories : [...prev.expenseCategories, expenseForm.category],
    }));
    setExpenseForm({ category: '', title: '', vendor: '', amount: '0', note: '', date: todayStr(), nepaliDate: nepaliToday() });
    setActiveTab('Accounting');
  };

  const addIncome = () => {
    if (!incomeForm.title.trim() || !incomeForm.category.trim()) return;
    const entry: IncomeEntry = {
      id: uniqueString('inc'),
      date: incomeForm.date,
      nepaliDate: incomeForm.nepaliDate,
      category: incomeForm.category,
      title: incomeForm.title,
      source: incomeForm.source,
      amount: Number(incomeForm.amount || 0),
      note: incomeForm.note,
    };
    setStore((prev) => ({
      ...prev,
      incomes: [entry, ...prev.incomes],
      incomeCategories: prev.incomeCategories.includes(incomeForm.category) ? prev.incomeCategories : [...prev.incomeCategories, incomeForm.category],
    }));
    setIncomeForm({ category: '', title: '', source: '', amount: '0', note: '', date: todayStr(), nepaliDate: nepaliToday() });
    setActiveTab('Accounting');
  };

  const addPayment = () => {
    if (!paymentForm.supplierId) return;
    const entry: PaymentEntry = {
      id: uniqueString('pay'),
      date: paymentForm.date,
      nepaliDate: paymentForm.nepaliDate,
      supplierId: paymentForm.supplierId,
      amount: Number(paymentForm.amount || 0),
      note: paymentForm.note,
    };
    setStore((prev) => ({ ...prev, payments: [entry, ...prev.payments] }));
    setPaymentForm({ supplierId: '', amount: '0', note: '', date: todayStr(), nepaliDate: nepaliToday() });
    setActiveTab('Accounting');
  };

  const salesReport = store.sales.filter((entry) => getRangeMatches(entry.date, reportRange));
  const purchaseReport = store.purchases.filter((entry) => getRangeMatches(entry.date, reportRange));
  const expenseReport = store.expenses.filter((entry) => getRangeMatches(entry.date, reportRange));
  const incomeReport = store.incomes.filter((entry) => getRangeMatches(entry.date, reportRange));

  const filteredSalesTotal = salesReport.reduce((sum, entry) => {
    const gross = entry.quantity * entry.sellingPrice;
    const discount = entry.discountType === 'percent' ? (gross * entry.discountValue) / 100 : entry.discountValue;
    return sum + (gross - discount);
  }, 0);

  const filteredPurchaseTotal = purchaseReport.reduce((sum, entry) => sum + entry.quantity * entry.purchasePrice, 0);
  const filteredExpenseTotal = expenseReport.reduce((sum, item) => sum + item.amount, 0);
  const filteredIncomeTotal = incomeReport.reduce((sum, item) => sum + item.amount, 0);

  const tabs: Tab[] = ['Dashboard', 'Products', 'Suppliers', 'Customers', 'Purchases', 'Sales', 'Returns', 'Accounting', 'Reports'];

  const renderDashboard = () => (
    <div>
      <div className="stats-grid">
        <div className="stat-card"><div className="label">Sales</div><div className="value">{formatCurrency(summary.totalSales)}</div></div>
        <div className="stat-card"><div className="label">Returns</div><div className="value">{formatCurrency(summary.totalReturns)}</div></div>
        <div className="stat-card"><div className="label">Purchases</div><div className="value">{formatCurrency(summary.totalPurchases)}</div></div>
        <div className="stat-card"><div className="label">Net Profit</div><div className="value">{formatCurrency(summary.netProfit)}</div></div>
      </div>
      <div className="grid-2">
        <div className="card">
          <h3>Quick Summary</h3>
          <div className="kpi-row">
            <div className="kpi"><strong>{formatNumber(store.products.length)}</strong><br /><span className="muted">Products</span></div>
            <div className="kpi"><strong>{formatNumber(store.suppliers.length)}</strong><br /><span className="muted">Suppliers</span></div>
            <div className="kpi"><strong>{formatNumber(store.customers.length)}</strong><br /><span className="muted">Customers</span></div>
          </div>
        </div>
        <div className="card">
          <h3>Inventory</h3>
          <table>
            <thead><tr><th>Product</th><th>Qty</th></tr></thead>
            <tbody>
              {store.products.slice(0, 8).map((product) => (
                <tr key={product.id}><td>{product.name}</td><td>{inventoryByProduct[product.id] || 0}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderProducts = () => (
    <div className="grid-2">
      <div className="card">
        <h3>Add Product</h3>
        <div className="form-grid">
          <div className="field">
            <label>Medicine Name</label>
            <input list="medicineList" value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} placeholder="Search medicine..." />
            <datalist id="medicineList">
              {MEDICINES_DATABASE.map((med) => <option key={med.name} value={med.name} />)}
            </datalist>
          </div>
          <div className="field">
            <label>Category</label>
            <select value={productForm.category} onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}>
              <option>Tablet</option>
              <option>Capsule</option>
              <option>Syrup</option>
              <option>Injection</option>
              <option>Drop</option>
              <option>Ointment</option>
              <option>Bandage</option>
              <option>Vitamins</option>
              <option>Inhaler</option>
            </select>
          </div>
          <div className="field">
            <label>Packing</label>
            <input value={productForm.packing} onChange={(e) => setProductForm({ ...productForm, packing: e.target.value })} placeholder="e.g., 10 tabs" />
          </div>
          <div className="field">
            <label>Product Code (Auto)</label>
            <input value={productForm.code || autoCode(productForm.category)} onChange={(e) => setProductForm({ ...productForm, code: e.target.value })} />
          </div>
          <div className="field">
            <label>Rack / Shelf</label>
            <input value={productForm.rack} onChange={(e) => setProductForm({ ...productForm, rack: e.target.value })} placeholder="A-01" />
          </div>
        </div>
        <div className="actions"><button className="btn btn-primary" onClick={addProduct}>Add & Continue</button></div>
      </div>
      <div className="card">
        <h3>Products ({store.products.length})</h3>
        <table>
          <thead><tr><th>Code</th><th>Name</th><th>Category</th><th>Rack</th><th>Stock</th></tr></thead>
          <tbody>
            {store.products.map((product) => (
              <tr key={product.id}><td>{product.code}</td><td>{product.name}</td><td>{product.category}</td><td>{product.rack}</td><td>{inventoryByProduct[product.id] || 0}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderSuppliers = () => (
    <div className="grid-2">
      <div className="card">
        <h3>Add Supplier</h3>
        <div className="form-grid">
          <div className="field"><label>Supplier Name</label><input value={supplierForm.name} onChange={(e) => setSupplierForm({ ...supplierForm, name: e.target.value })} /></div>
          <div className="field"><label>Contact Person</label><input value={supplierForm.contact} onChange={(e) => setSupplierForm({ ...supplierForm, contact: e.target.value })} /></div>
          <div className="field"><label>Phone</label><input value={supplierForm.phone} onChange={(e) => setSupplierForm({ ...supplierForm, phone: e.target.value })} /></div>
          <div className="field"><label>Address</label><textarea value={supplierForm.address} onChange={(e) => setSupplierForm({ ...supplierForm, address: e.target.value })} /></div>
        </div>
        <div className="actions"><button className="btn btn-primary" onClick={addSupplier}>Save Supplier</button></div>
      </div>
      <div className="card">
        <h3>Suppliers ({store.suppliers.length})</h3>
        <table>
          <thead><tr><th>Name</th><th>Contact</th><th>Phone</th></tr></thead>
          <tbody>
            {store.suppliers.map((supplier) => (
              <tr key={supplier.id}><td>{supplier.name}</td><td>{supplier.contact}</td><td>{supplier.phone}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderCustomers = () => (
    <div className="grid-2">
      <div className="card">
        <h3>Add Customer</h3>
        <div className="form-grid">
          <div className="field"><label>Customer Name</label><input value={customerForm.name} onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })} /></div>
          <div className="field"><label>Phone</label><input value={customerForm.phone} onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })} /></div>
          <div className="field"><label>Address</label><textarea value={customerForm.address} onChange={(e) => setCustomerForm({ ...customerForm, address: e.target.value })} /></div>
        </div>
        <div className="actions"><button className="btn btn-primary" onClick={addCustomer}>Save Customer</button></div>
      </div>
      <div className="card">
        <h3>Customers ({store.customers.length})</h3>
        <table>
          <thead><tr><th>Name</th><th>Phone</th><th>Address</th></tr></thead>
          <tbody>
            {store.customers.map((customer) => (
              <tr key={customer.id}><td>{customer.name}</td><td>{customer.phone}</td><td>{customer.address}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderPurchases = () => (
    <div className="grid-2">
      <div className="card">
        <h3>Purchase Entry</h3>
        <div className="form-grid">
          <div className="field"><label>Supplier</label><select value={purchaseForm.supplierId} onChange={(e) => setPurchaseForm({ ...purchaseForm, supplierId: e.target.value })}><option value="">Select</option>{store.suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
          <div className="field"><label>Product</label><select value={purchaseForm.productId} onChange={(e) => setPurchaseForm({ ...purchaseForm, productId: e.target.value })}><option value="">Select</option>{store.products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
          <div className="field"><label>AD Date</label><input type="date" value={purchaseForm.date} onChange={(e) => setPurchaseForm({ ...purchaseForm, date: e.target.value })} /></div>
          <div className="field"><label>Nepali Date</label><input type="date" value={purchaseForm.nepaliDate} onChange={(e) => setPurchaseForm({ ...purchaseForm, nepaliDate: e.target.value })} /></div>
          <div className="field"><label>Batch Number</label><input value={purchaseForm.batch} onChange={(e) => setPurchaseForm({ ...purchaseForm, batch: e.target.value })} /></div>
          <div className="field"><label>Expiry Date</label><input type="date" value={purchaseForm.expiry} onChange={(e) => setPurchaseForm({ ...purchaseForm, expiry: e.target.value })} /></div>
          <div className="field"><label>Quantity</label><input type="number" value={purchaseForm.quantity} onChange={(e) => setPurchaseForm({ ...purchaseForm, quantity: e.target.value })} /></div>
          <div className="field"><label>Purchase Price</label><input type="number" value={purchaseForm.purchasePrice} onChange={(e) => setPurchaseForm({ ...purchaseForm, purchasePrice: e.target.value })} /></div>
          <div className="field"><label>Selling Price (Manual)</label><input type="number" value={purchaseForm.sellingPrice} onChange={(e) => setPurchaseForm({ ...purchaseForm, sellingPrice: e.target.value })} /></div>
          <div className="field"><label>Discount Type</label><select value={purchaseForm.discountType} onChange={(e) => setPurchaseForm({ ...purchaseForm, discountType: e.target.value as 'percent' | 'amount' })}><option value="percent">%</option><option value="amount">Amount</option></select></div>
          <div className="field"><label>Discount Value</label><input type="number" value={purchaseForm.discountValue} onChange={(e) => setPurchaseForm({ ...purchaseForm, discountValue: e.target.value })} /></div>
          <div className="field"><label>Payment Due (Days)</label><select value={purchaseForm.dueDays} onChange={(e) => setPurchaseForm({ ...purchaseForm, dueDays: e.target.value })}><option value="30">30</option><option value="60">60</option><option value="90">90</option><option value="120">120</option></select></div>
        </div>
        <div className="actions"><button className="btn btn-primary" onClick={addPurchase}>Save Purchase</button></div>
      </div>
      <div className="card">
        <h3>Purchase Bills ({store.purchases.length})</h3>
        <table>
          <thead><tr><th>Nepali Date</th><th>Supplier</th><th>Product</th><th>Qty</th><th>Batch</th><th>Buy Price</th><th>Due</th></tr></thead>
          <tbody>
            {store.purchases.map((pur) => (
              <tr key={pur.id}><td>{pur.nepaliDate}</td><td>{getSupplierName(pur.supplierId)}</td><td>{getProductName(pur.productId)}</td><td>{pur.quantity}</td><td>{pur.batch}</td><td>{formatCurrency(pur.purchasePrice)}</td><td>{pur.dueDate}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderSales = () => (
    <div className="grid-2">
      <div className="card">
        <h3>Sales Bill Entry</h3>
        <div className="form-grid">
          <div className="field"><label>Customer</label><select value={saleForm.customerId} onChange={(e) => setSaleForm({ ...saleForm, customerId: e.target.value })}><option value="">Select</option>{store.customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
          <div className="field"><label>Product</label><select value={saleForm.productId} onChange={(e) => setSaleForm({ ...saleForm, productId: e.target.value })}><option value="">Select</option>{store.products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
          <div className="field"><label>AD Date</label><input type="date" value={saleForm.date} onChange={(e) => setSaleForm({ ...saleForm, date: e.target.value })} /></div>
          <div className="field"><label>Nepali Date</label><input type="date" value={saleForm.nepaliDate} onChange={(e) => setSaleForm({ ...saleForm, nepaliDate: e.target.value })} /></div>
          <div className="field"><label>Quantity</label><input type="number" value={saleForm.quantity} onChange={(e) => setSaleForm({ ...saleForm, quantity: e.target.value })} /></div>
          <div className="field"><label>Selling Price</label><input type="number" value={saleForm.sellingPrice} onChange={(e) => setSaleForm({ ...saleForm, sellingPrice: e.target.value })} /></div>
          <div className="field"><label>Discount Type</label><select value={saleForm.discountType} onChange={(e) => setSaleForm({ ...saleForm, discountType: e.target.value as 'percent' | 'amount' })}><option value="percent">%</option><option value="amount">Amount</option></select></div>
          <div className="field"><label>Discount Value</label><input type="number" value={saleForm.discountValue} onChange={(e) => setSaleForm({ ...saleForm, discountValue: e.target.value })} /></div>
          <div className="field"><label>Paid Amount</label><input type="number" value={saleForm.paid} onChange={(e) => setSaleForm({ ...saleForm, paid: e.target.value })} /></div>
        </div>
        <div className="actions"><button className="btn btn-primary" onClick={addSale}>Print & New Bill</button></div>
      </div>
      <div className="card">
        <h3>Sales Bills ({store.sales.length})</h3>
        <table>
          <thead><tr><th>Date</th><th>Customer</th><th>Product</th><th>Qty</th><th>Amount</th><th>Paid</th></tr></thead>
          <tbody>
            {store.sales.map((sale) => {
              const base = sale.quantity * sale.sellingPrice;
              const disc = sale.discountType === 'percent' ? (base * sale.discountValue) / 100 : sale.discountValue;
              return <tr key={sale.id}><td>{sale.nepaliDate}</td><td>{getCustomerName(sale.customerId)}</td><td>{getProductName(sale.productId)}</td><td>{sale.quantity}</td><td>{formatCurrency(base - disc)}</td><td>{formatCurrency(sale.paid)}</td></tr>;
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  const returnReasons = ['Damaged', 'Expired', 'Wrong Product', 'Short Qty', 'Quality Issue', 'Other'];

  const renderReturns = () => (
    <div className="grid-2">
      <div className="card">
        <h3>Sales Return Entry</h3>
        <div className="form-grid">
          <div className="field"><label>Sale Bill</label><select value={saleReturnForm.saleId} onChange={(e) => setSaleReturnForm({ ...saleReturnForm, saleId: e.target.value })}><option value="">Select</option>{store.sales.map((s) => <option key={s.id} value={s.id}>{`${s.id.slice(0, 8)} - ${getCustomerName(s.customerId)}`}</option>)}</select></div>
          <div className="field"><label>Reason (Select)</label><select value={saleReturnForm.reason} onChange={(e) => setSaleReturnForm({ ...saleReturnForm, reason: e.target.value })}><option value="">Choose reason</option>{returnReasons.map((r) => <option key={r} value={r}>{r}</option>)}</select></div>
          <div className="field"><label>Quantity</label><input type="number" value={saleReturnForm.quantity} onChange={(e) => setSaleReturnForm({ ...saleReturnForm, quantity: e.target.value })} /></div>
        </div>
        <div className="actions"><button className="btn btn-warning" onClick={addSaleReturn}>Print Return & New</button></div>
      </div>
      <div className="card">
        <h3>Return History ({store.saleReturns.length})</h3>
        <table>
          <thead><tr><th>Date</th><th>Sale ID</th><th>Reason</th><th>Qty</th></tr></thead>
          <tbody>
            {store.saleReturns.map((ret) => (
              <tr key={ret.id}><td>{ret.nepaliDate}</td><td>{ret.saleId.slice(0, 8)}</td><td>{ret.reason}</td><td>{ret.quantity}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderAccounting = () => (
    <div className="grid-2">
      <div className="card">
        <h3>Expense Entry</h3>
        <div className="form-grid">
          <div className="field"><label>Category (Add Custom)</label><select value={expenseForm.category} onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}><option value="">Choose or add new</option>{store.expenseCategories.map((c) => <option key={c} value={c}>{c}</option>)}</select><input type="text" placeholder="Or type new category" onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })} style={{ marginTop: 4 }} /></div>
          <div className="field"><label>Title</label><input value={expenseForm.title} onChange={(e) => setExpenseForm({ ...expenseForm, title: e.target.value })} /></div>
          <div className="field"><label>Vendor (Optional)</label><input value={expenseForm.vendor} onChange={(e) => setExpenseForm({ ...expenseForm, vendor: e.target.value })} /></div>
          <div className="field"><label>Nepali Date</label><input type="date" value={expenseForm.nepaliDate} onChange={(e) => setExpenseForm({ ...expenseForm, nepaliDate: e.target.value })} /></div>
          <div className="field"><label>Amount</label><input type="number" value={expenseForm.amount} onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })} /></div>
          <div className="field" style={{ gridColumn: '1 / -1' }}><label>Note</label><textarea value={expenseForm.note} onChange={(e) => setExpenseForm({ ...expenseForm, note: e.target.value })} /></div>
        </div>
        <div className="actions"><button className="btn btn-primary" onClick={addExpense}>Save Expense</button></div>
      </div>
      <div className="card">
        <h3>Income Entry</h3>
        <div className="form-grid">
          <div className="field"><label>Category (Add Custom)</label><select value={incomeForm.category} onChange={(e) => setIncomeForm({ ...incomeForm, category: e.target.value })}><option value="">Choose or add new</option>{store.incomeCategories.map((c) => <option key={c} value={c}>{c}</option>)}</select><input type="text" placeholder="Or type new category" onChange={(e) => setIncomeForm({ ...incomeForm, category: e.target.value })} style={{ marginTop: 4 }} /></div>
          <div className="field"><label>Title</label><input value={incomeForm.title} onChange={(e) => setIncomeForm({ ...incomeForm, title: e.target.value })} /></div>
          <div className="field"><label>Source</label><input value={incomeForm.source} onChange={(e) => setIncomeForm({ ...incomeForm, source: e.target.value })} /></div>
          <div className="field"><label>Nepali Date</label><input type="date" value={incomeForm.nepaliDate} onChange={(e) => setIncomeForm({ ...incomeForm, nepaliDate: e.target.value })} /></div>
          <div className="field"><label>Amount</label><input type="number" value={incomeForm.amount} onChange((e) => setIncomeForm({ ...incomeForm, amount: e.target.value })} /></div>
          <div className="field" style={{ gridColumn: '1 / -1' }}><label>Note</label><textarea value={incomeForm.note} onChange={(e) => setIncomeForm({ ...incomeForm, note: e.target.value })} /></div>
        </div>
        <div className="actions"><button className="btn btn-success" onClick={addIncome}>Save Income</button></div>
      </div>
      <div className="card">
        <h3>Supplier Payment</h3>
        <div className="form-grid">
          <div className="field"><label>Supplier</label><select value={paymentForm.supplierId} onChange={(e) => setPaymentForm({ ...paymentForm, supplierId: e.target.value })}><option value="">Select</option>{store.suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
          <div className="field"><label>Amount</label><input type="number" value={paymentForm.amount} onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })} /></div>
          <div className="field"><label>Nepali Date</label><input type="date" value={paymentForm.nepaliDate} onChange={(e) => setPaymentForm({ ...paymentForm, nepaliDate: e.target.value })} /></div>
          <div className="field" style={{ gridColumn: '1 / -1' }}><label>Note</label><textarea value={paymentForm.note} onChange={(e) => setPaymentForm({ ...paymentForm, note: e.target.value })} /></div>
        </div>
        <div className="actions"><button className="btn btn-primary" onClick={addPayment}>Save Payment</button></div>
      </div>
    </div>
  );

  const renderReports = () => (
    <div>
      <div className="card print-area" id="print-section">
        <div className="inline-row" style={{ marginBottom: 16 }}>
          <h3 style={{ margin: 0 }}>Financial Reports & Ledgers</h3>
          <div className="spacer" />
          <select value={reportRange} onChange={(e) => setReportRange(e.target.value as ReportRange)}>
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="thisWeek">This Week</option>
            <option value="thisMonth">This Month</option>
            <option value="lastMonth">Last Month</option>
            <option value="thisYear">This Year</option>
          </select>
          <button className="btn btn-secondary no-print" onClick={() => window.print()}>Print Page</button>
        </div>

        <div className="stats-grid">
          <div className="stat-card"><div className="label">Sales</div><div className="value">{formatCurrency(filteredSalesTotal)}</div></div>
          <div className="stat-card"><div className="label">Purchases</div><div className="value">{formatCurrency(filteredPurchaseTotal)}</div></div>
          <div className="stat-card"><div className="label">Expenses</div><div className="value">{formatCurrency(filteredExpenseTotal)}</div></div>
          <div className="stat-card"><div className="label">Income</div><div className="value">{formatCurrency(filteredIncomeTotal)}</div></div>
        </div>

        <h4 style={{ pageBreakBefore: 'avoid', marginTop: 20 }}>Profit & Loss Statement (Single Page)</h4>
        <table>
          <tbody>
            <tr><td><strong>Sales</strong></td><td style={{ textAlign: 'right' }}><strong>{formatCurrency(filteredSalesTotal)}</strong></td></tr>
            <tr><td colspan={2} style={{ height: 1, background: '#000' }} /></tr>
            <tr><td>Less: Purchase Cost</td><td style={{ textAlign: 'right' }}>{formatCurrency(filteredPurchaseTotal)}</td></tr>
            <tr><td><strong>Gross Profit</strong></td><td style={{ textAlign: 'right' }}><strong>{formatCurrency(filteredSalesTotal - filteredPurchaseTotal)}</strong></td></tr>
            <tr><td colspan={2} style={{ height: 1, background: '#000' }} /></tr>
            <tr><td>Less: Expenses</td><td style={{ textAlign: 'right' }}>{formatCurrency(filteredExpenseTotal)}</td></tr>
            <tr><td>Plus: Income</td><td style={{ textAlign: 'right' }}>{formatCurrency(filteredIncomeTotal)}</td></tr>
            <tr><td colspan={2} style={{ height: 2, background: '#000' }} /></tr>
            <tr><td><strong>NET PROFIT</strong></td><td style={{ textAlign: 'right' }}><strong>{formatCurrency(filteredSalesTotal - filteredPurchaseTotal - filteredExpenseTotal + filteredIncomeTotal)}</strong></td></tr>
          </tbody>
        </table>

        <h4 style={{ pageBreakBefore: 'always', marginTop: 20 }}>Sales Report</h4>
        <table>
          <thead><tr><th>Date</th><th>Customer</th><th>Product</th><th>Qty</th><th>Amount</th></tr></thead>
          <tbody>
            {salesReport.map((sale) => {
              const gross = sale.quantity * sale.sellingPrice;
              const discount = sale.discountType === 'percent' ? (gross * sale.discountValue) / 100 : sale.discountValue;
              return <tr key={sale.id}><td>{sale.nepaliDate}</td><td>{getCustomerName(sale.customerId)}</td><td>{getProductName(sale.productId)}</td><td>{sale.quantity}</td><td>{formatCurrency(gross - discount)}</td></tr>;
            })}
            <tr style={{ fontWeight: 'bold' }}><td colspan={4}>Total Sales</td><td>{formatCurrency(filteredSalesTotal)}</td></tr>
          </tbody>
        </table>

        <h4 style={{ pageBreakBefore: 'always', marginTop: 20 }}>Purchase Report</h4>
        <table>
          <thead><tr><th>Date</th><th>Supplier</th><th>Product</th><th>Qty</th><th>Amount</th><th>Due Date</th></tr></thead>
          <tbody>
            {purchaseReport.map((item) => (
              <tr key={item.id}><td>{item.nepaliDate}</td><td>{getSupplierName(item.supplierId)}</td><td>{getProductName(item.productId)}</td><td>{item.quantity}</td><td>{formatCurrency(item.quantity * item.purchasePrice)}</td><td>{item.dueDate}</td></tr>
            ))}
            <tr style={{ fontWeight: 'bold' }}><td colspan={4}>Total Purchase</td><td colspan={2}>{formatCurrency(filteredPurchaseTotal)}</td></tr>
          </tbody>
        </table>

        <h4 style={{ pageBreakBefore: 'always', marginTop: 20 }}>Supplier Ledger</h4>
        <table>
          <thead><tr><th>Supplier</th><th>Date</th><th>Description</th><th>Amount</th></tr></thead>
          <tbody>
            {store.suppliers.map((sup) => {
              const supPurchases = store.purchases.filter((p) => p.supplierId === sup.id);
              const supPayments = store.payments.filter((p) => p.supplierId === sup.id);
              const balance = supPurchases.reduce((s, p) => s + p.quantity * p.purchasePrice, 0) - supPayments.reduce((s, p) => s + p.amount, 0);
              return (
                <React.Fragment key={sup.id}>
                  <tr style={{ fontWeight: 'bold', background: '#f0f0f0' }}><td colspan={4}>{sup.name}</td></tr>
                  {supPurchases.map((pur) => <tr key={pur.id}><td></td><td>{pur.nepaliDate}</td><td>Purchase Bill</td><td>{formatCurrency(pur.quantity * pur.purchasePrice)}</td></tr>)}
                  {supPayments.map((pay) => <tr key={pay.id}><td></td><td>{pay.nepaliDate}</td><td>Payment</td><td>({formatCurrency(pay.amount)})</td></tr>)}
                  <tr style={{ fontWeight: 'bold' }}><td></td><td colspan={2}>Balance Due</td><td>{formatCurrency(balance)}</td></tr>
                </React.Fragment>
              );
            })}
          </tbody>
        </table>

        <h4 style={{ pageBreakBefore: 'always', marginTop: 20 }}>Customer Ledger</h4>
        <table>
          <thead><tr><th>Customer</th><th>Date</th><th>Description</th><th>Amount</th></tr></thead>
          <tbody>
            {store.customers.map((cus) => {
              const cusSales = store.sales.filter((s) => s.customerId === cus.id);
              const cusBalance = cusSales.reduce((sum, s) => {
                const gross = s.quantity * s.sellingPrice;
                const discount = s.discountType === 'percent' ? (gross * s.discountValue) / 100 : s.discountValue;
                return sum + (gross - discount - s.paid);
              }, 0);
              return (
                <React.Fragment key={cus.id}>
                  <tr style={{ fontWeight: 'bold', background: '#f0f0f0' }}><td colspan={4}>{cus.name}</td></tr>
                  {cusSales.map((sal) => {
                    const gross = sal.quantity * sal.sellingPrice;
                    const discount = sal.discountType === 'percent' ? (gross * sal.discountValue) / 100 : sal.discountValue;
                    return <tr key={sal.id}><td></td><td>{sal.nepaliDate}</td><td>Sale Bill</td><td>{formatCurrency(gross - discount)}</td></tr>;
                  })}
                  <tr style={{ fontWeight: 'bold' }}><td></td><td colspan={2}>Balance Due</td><td>{formatCurrency(cusBalance)}</td></tr>
                </React.Fragment>
              );
            })}
          </tbody>
        </table>

        <h4 style={{ pageBreakBefore: 'always', marginTop: 20 }}>Expense Ledger</h4>
        <table>
          <thead><tr><th>Date</th><th>Category</th><th>Title</th><th>Vendor</th><th>Amount</th></tr></thead>
          <tbody>
            {expenseReport.map((item) => <tr key={item.id}><td>{item.nepaliDate}</td><td>{item.category}</td><td>{item.title}</td><td>{item.vendor}</td><td>{formatCurrency(item.amount)}</td></tr>)}
            <tr style={{ fontWeight: 'bold' }}><td colspan={4}>Total Expenses</td><td>{formatCurrency(filteredExpenseTotal)}</td></tr>
          </tbody>
        </table>

        <h4 style={{ pageBreakBefore: 'always', marginTop: 20 }}>Income Ledger</h4>
        <table>
          <thead><tr><th>Date</th><th>Category</th><th>Title</th><th>Source</th><th>Amount</th></tr></thead>
          <tbody>
            {incomeReport.map((item) => <tr key={item.id}><td>{item.nepaliDate}</td><td>{item.category}</td><td>{item.title}</td><td>{item.source}</td><td>{formatCurrency(item.amount)}</td></tr>)}
            <tr style={{ fontWeight: 'bold' }}><td colspan={4}>Total Income</td><td>{formatCurrency(filteredIncomeTotal)}</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <h1>Medical Accounting System</h1>
          <small>Pharmacy Billing & Ledger</small>
        </div>
        <div className="topbar-actions">
          <span className="small-badge">Nepali & AD Dates</span>
          <span className="small-badge">Systemic Print</span>
        </div>
      </header>

      <div className="layout">
        <aside className="sidebar no-print">
          <div className="nav-group">
            {tabs.map((tab) => (
              <button key={tab} className={`nav-item ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>{tab}</button>
            ))}
          </div>
        </aside>

        <main className="content">
          {activeTab === 'Dashboard' && renderDashboard()}
          {activeTab === 'Products' && renderProducts()}
          {activeTab === 'Suppliers' && renderSuppliers()}
          {activeTab === 'Customers' && renderCustomers()}
          {activeTab === 'Purchases' && renderPurchases()}
          {activeTab === 'Sales' && renderSales()}
          {activeTab === 'Returns' && renderReturns()}
          {activeTab === 'Accounting' && renderAccounting()}
          {activeTab === 'Reports' && renderReports()}
        </main>
      </div>
    </div>
  );
}

export default App;
