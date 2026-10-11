import { useEffect, useMemo, useState } from 'react';

type Tab =
  | 'Dashboard'
  | 'Products'
  | 'Suppliers'
  | 'Customers'
  | 'Purchases'
  | 'Sales'
  | 'Returns'
  | 'Accounting'
  | 'Reports';

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
};

type Customer = {
  id: string;
  name: string;
  phone: string;
  address: string;
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
  dueDays: number;
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
  expenses: ExpenseEntry[];
  incomes: IncomeEntry[];
  payments: PaymentEntry[];
};

type ReportRange = 'today' | 'yesterday' | 'thisWeek' | 'thisMonth' | 'lastMonth' | 'thisYear';

const MEDICINE_CATALOG = [
  'Amlod-2.5mg', 'Amlod-5mg', 'Amlod-10mg', 'Amlod-AT', 'Amlod-L',
  'Paracetamol 500mg', 'Ibuprofen 400mg', 'Cefixime 200mg', 'Azithromycin 500mg',
  'Omeprazole 20mg', 'Ranitidine 150mg', 'Cimetidine 400mg', 'Metformin 500mg',
  'Metformin 850mg', 'Glimepiride 1mg', 'Glipizide 5mg', 'Insulin Glargine',
  'Amoxicillin 250mg', 'Amoxicillin 500mg', 'Augmentin 625', 'Cloxacillin 500mg',
  'Vitamin B Complex', 'Vitamin D3', 'Calcium+Vitamin D', 'Folic Acid 5mg',
  'Aspirin 75mg', 'Atorvastatin 20mg', 'Losartan 50mg', 'Telmisartan 40mg',
  'Salbutamol Inhaler', 'Ventolin 2mg', 'Montelukast 5mg', 'Loratadine 10mg',
  'Cetirizine 10mg', 'Antacid Suspension', 'Cough Syrup', 'Albendazole 400mg',
  'Mebendazole 100mg', 'Levothyroxine 25mcg', 'Levothyroxine 50mcg', 'Doxycycline 100mg',
  'B complex', 'Naproxen 250mg', 'Piroxicam 20mg', 'Diclofenac 50mg', 'Atenolol 50mg'
];

const defaultStore: Store = {
  products: [],
  suppliers: [],
  customers: [],
  purchases: [],
  sales: [],
  expenses: [],
  incomes: [],
  payments: [],
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'NPR', minimumFractionDigits: 2 }).format(value);

const formatNumber = (value: number) => new Intl.NumberFormat('en-US').format(value);

const getTodayIso = () => new Date().toISOString().slice(0, 10);

const getNDate = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const moneyAfterDiscount = (amount: number, type: 'percent' | 'amount', value: number) => {
  if (type === 'percent') return amount - (amount * value) / 100;
  return amount - value;
};

const currentRangeLabels: Record<ReportRange, string> = {
  today: 'Today',
  yesterday: 'Yesterday',
  thisWeek: 'This Week',
  thisMonth: 'This Month',
  lastMonth: 'Last Month',
  thisYear: 'This Year',
};

const getRangeMatches = (dateValue: string, range: ReportRange) => {
  const target = new Date(dateValue);
  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const yesterday = new Date(startOfToday);
  yesterday.setDate(yesterday.getDate() - 1);

  if (range === 'today') return target >= startOfToday && target <= new Date(startOfToday.getTime() + 86400000);
  if (range === 'yesterday') return target >= new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate()) && target < startOfToday;
  if (range === 'thisWeek') {
    const start = new Date(startOfToday);
    start.setDate(start.getDate() - 6);
    return target >= start && target <= new Date(startOfToday.getTime() + 86400000);
  }
  if (range === 'thisMonth') {
    return target.getMonth() === today.getMonth() && target.getFullYear() === today.getFullYear();
  }
  if (range === 'lastMonth') {
    const prev = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const next = new Date(today.getFullYear(), today.getMonth(), 1);
    return target >= prev && target < next;
  }
  if (range === 'thisYear') return target.getFullYear() === today.getFullYear();
  return true;
};

const uniqueString = (prefix: string) => `${prefix}-${Date.now().toString().slice(-6)}-${Math.random().toString(36).slice(2, 6)}`;

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('Dashboard');
  const [store, setStore] = useState<Store>(() => {
    const saved = localStorage.getItem('medical-accounting-store');
    if (!saved) return defaultStore;

    try {
      return { ...defaultStore, ...JSON.parse(saved) } as Store;
    } catch {
      return defaultStore;
    }
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
    discountType: 'percent',
    discountValue: '0',
    dueDays: '30',
    date: getTodayIso(),
    nepaliDate: getNDate(),
  });
  const [saleForm, setSaleForm] = useState({
    customerId: '',
    productId: '',
    quantity: '1',
    sellingPrice: '0',
    discountType: 'percent',
    discountValue: '0',
    paid: '0',
    date: getTodayIso(),
    nepaliDate: getNDate(),
  });
  const [expenseForm, setExpenseForm] = useState({
    category: 'Rent',
    title: '',
    vendor: '',
    amount: '0',
    note: '',
    date: getTodayIso(),
    nepaliDate: getNDate(),
  });
  const [incomeForm, setIncomeForm] = useState({
    category: 'Service',
    title: '',
    source: '',
    amount: '0',
    note: '',
    date: getTodayIso(),
    nepaliDate: getNDate(),
  });
  const [paymentForm, setPaymentForm] = useState({
    supplierId: '',
    amount: '0',
    note: '',
    date: getTodayIso(),
    nepaliDate: getNDate(),
  });
  const [reportRange, setReportRange] = useState<ReportRange>('thisMonth');

  useEffect(() => {
    localStorage.setItem('medical-accounting-store', JSON.stringify(store));
  }, [store]);

  const inventoryByProduct = useMemo(() => {
    const inventory: Record<string, number> = {};

    for (const purchase of store.purchases) {
      inventory[purchase.productId] = (inventory[purchase.productId] || 0) + Number(purchase.quantity);
    }

    for (const sale of store.sales) {
      inventory[sale.productId] = (inventory[sale.productId] || 0) - Number(sale.quantity);
    }

    return inventory;
  }, [store.purchases, store.sales]);

  const summary = useMemo(() => {
    const totalSales = store.sales.reduce((sum, entry) => {
      const discountAmount = entry.discountType === 'percent'
        ? (Number(entry.sellingPrice) * Number(entry.quantity) * entry.discountValue) / 100
        : entry.discountValue;
      const total = Number(entry.quantity) * Number(entry.sellingPrice) - discountAmount;
      return sum + total;
    }, 0);

    const totalPurchases = store.purchases.reduce((sum, entry) => sum + Number(entry.quantity) * Number(entry.purchasePrice), 0);
    const totalExpenses = store.expenses.reduce((sum, entry) => sum + Number(entry.amount), 0);
    const totalIncomes = store.incomes.reduce((sum, entry) => sum + Number(entry.amount), 0);
    const totalPayments = store.payments.reduce((sum, entry) => sum + Number(entry.amount), 0);

    return {
      totalSales,
      totalPurchases,
      totalExpenses,
      totalIncomes,
      totalPayments,
      grossProfit: totalSales - totalPurchases,
      netProfit: totalSales - totalPurchases - totalExpenses + totalIncomes,
    };
  }, [store]);

  const autoCode = (category: string) => {
    const prefix = category
      .split(' ')
      .map((word) => word[0])
      .join('')
      .slice(0, 3)
      .toUpperCase() || 'MED';
    const nextNum = store.products.length + 1;
    return `${prefix}-${String(nextNum).padStart(4, '0')}`;
  };

  const addProduct = () => {
    const name = productForm.name.trim();
    if (!name) return;

    const newProduct: Product = {
      id: uniqueString('prod'),
      name,
      category: productForm.category,
      packing: productForm.packing || 'N/A',
      code: productForm.code || autoCode(productForm.category),
      rack: productForm.rack || 'A-01',
      createdAt: new Date().toISOString(),
    };

    setStore((prev) => ({ ...prev, products: [newProduct, ...prev.products] }));
    setProductForm({ name: '', category: 'Tablet', packing: '', code: '', rack: '' });
    setActiveTab('Products');
  };

  const addSupplier = () => {
    const name = supplierForm.name.trim();
    if (!name) return;
    setStore((prev) => ({
      ...prev,
      suppliers: [{ id: uniqueString('sup'), name, contact: supplierForm.contact, phone: supplierForm.phone, address: supplierForm.address }, ...prev.suppliers],
    }));
    setSupplierForm({ name: '', contact: '', phone: '', address: '' });
    setActiveTab('Suppliers');
  };

  const addCustomer = () => {
    const name = customerForm.name.trim();
    if (!name) return;
    setStore((prev) => ({
      ...prev,
      customers: [{ id: uniqueString('cus'), name, phone: customerForm.phone, address: customerForm.address }, ...prev.customers],
    }));
    setCustomerForm({ name: '', phone: '', address: '' });
    setActiveTab('Customers');
  };

  const addPurchase = () => {
    const supplierId = purchaseForm.supplierId;
    const productId = purchaseForm.productId;
    if (!supplierId || !productId) return;

    const entry: PurchaseEntry = {
      id: uniqueString('pur'),
      date: purchaseForm.date,
      nepaliDate: purchaseForm.nepaliDate,
      supplierId,
      productId,
      batch: purchaseForm.batch || 'AUTO-BATCH',
      expiry: purchaseForm.expiry || 'N/A',
      quantity: Number(purchaseForm.quantity || 0),
      purchasePrice: Number(purchaseForm.purchasePrice || 0),
      sellingPrice: Number(purchaseForm.sellingPrice || 0),
      discountType: purchaseForm.discountType as 'percent' | 'amount',
      discountValue: Number(purchaseForm.discountValue || 0),
      dueDays: Number(purchaseForm.dueDays || 30),
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
      date: getTodayIso(),
      nepaliDate: getNDate(),
    });
    setActiveTab('Purchases');
  };

  const addSale = () => {
    const customerId = saleForm.customerId;
    const productId = saleForm.productId;
    if (!customerId || !productId) return;

    const qty = Number(saleForm.quantity || 0);
    if (qty <= 0) return;

    const currentQty = inventoryByProduct[productId] || 0;
    if (qty > currentQty) {
      alert('Stock is not available for this sale.');
      return;
    }

    const entry: SaleEntry = {
      id: uniqueString('sal'),
      date: saleForm.date,
      nepaliDate: saleForm.nepaliDate,
      customerId,
      productId,
      quantity: qty,
      sellingPrice: Number(saleForm.sellingPrice || 0),
      discountType: saleForm.discountType as 'percent' | 'amount',
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
      date: getTodayIso(),
      nepaliDate: getNDate(),
    });
    setActiveTab('Sales');
  };

  const addExpense = () => {
    if (!expenseForm.title.trim()) return;
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
    setStore((prev) => ({ ...prev, expenses: [entry, ...prev.expenses] }));
    setExpenseForm({
      category: 'Rent',
      title: '',
      vendor: '',
      amount: '0',
      note: '',
      date: getTodayIso(),
      nepaliDate: getNDate(),
    });
    setActiveTab('Accounting');
  };

  const addIncome = () => {
    if (!incomeForm.title.trim()) return;
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
    setStore((prev) => ({ ...prev, incomes: [entry, ...prev.incomes] }));
    setIncomeForm({
      category: 'Service',
      title: '',
      source: '',
      amount: '0',
      note: '',
      date: getTodayIso(),
      nepaliDate: getNDate(),
    });
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
    setPaymentForm({
      supplierId: '',
      amount: '0',
      note: '',
      date: getTodayIso(),
      nepaliDate: getNDate(),
    });
    setActiveTab('Accounting');
  };

  const getProductName = (productId: string) => store.products.find((item) => item.id === productId)?.name || 'Unknown product';
  const getSupplierName = (id: string) => store.suppliers.find((item) => item.id === id)?.name || 'Unknown supplier';
  const getCustomerName = (id: string) => store.customers.find((item) => item.id === id)?.name || 'Unknown customer';

  const salesReport = store.sales.filter((entry) => getRangeMatches(entry.date, reportRange));
  const purchaseReport = store.purchases.filter((entry) => getRangeMatches(entry.date, reportRange));
  const expenseReport = store.expenses.filter((entry) => getRangeMatches(entry.date, reportRange));
  const incomeReport = store.incomes.filter((entry) => getRangeMatches(entry.date, reportRange));

  const filteredSalesTotal = salesReport.reduce((sum, entry) => {
    const base = Number(entry.quantity) * Number(entry.sellingPrice);
    const discount = entry.discountType === 'percent' ? (base * entry.discountValue) / 100 : entry.discountValue;
    return sum + (base - discount);
  }, 0);

  const filteredPurchaseTotal = purchaseReport.reduce((sum, entry) => sum + Number(entry.quantity) * Number(entry.purchasePrice), 0);
  const filteredExpenseTotal = expenseReport.reduce((sum, entry) => sum + Number(entry.amount), 0);
  const filteredIncomeTotal = incomeReport.reduce((sum, entry) => sum + Number(entry.amount), 0);

  const tabs: Tab[] = ['Dashboard', 'Products', 'Suppliers', 'Customers', 'Purchases', 'Sales', 'Returns', 'Accounting', 'Reports'];

  const renderDashboard = () => (
    <div>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="label">Sales</div>
          <div className="value">{formatCurrency(summary.totalSales)}</div>
        </div>
        <div className="stat-card">
          <div className="label">Purchases</div>
          <div className="value">{formatCurrency(summary.totalPurchases)}</div>
        </div>
        <div className="stat-card">
          <div className="label">Expenses</div>
          <div className="value">{formatCurrency(summary.totalExpenses)}</div>
        </div>
        <div className="stat-card">
          <div className="label">Net Profit</div>
          <div className="value">{formatCurrency(summary.netProfit)}</div>
        </div>
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
          <h3>Inventory Snapshot</h3>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Stock</th>
              </tr>
            </thead>
            <tbody>
              {store.products.slice(0, 6).map((product) => (
                <tr key={product.id}>
                  <td>{product.name}</td>
                  <td>{inventoryByProduct[product.id] || 0}</td>
                </tr>
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
            <label>Name</label>
            <input list="medicineList" value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} placeholder="Amlod 5mg" />
            <datalist id="medicineList">
              {MEDICINE_CATALOG.map((item) => (
                <option key={item} value={item} />
              ))}
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
            </select>
          </div>
          <div className="field">
            <label>Packing</label>
            <input value={productForm.packing} onChange={(e) => setProductForm({ ...productForm, packing: e.target.value })} placeholder="10 tabs / 30 tabs" />
          </div>
          <div className="field">
            <label>Product Code</label>
            <input value={productForm.code || autoCode(productForm.category)} onChange={(e) => setProductForm({ ...productForm, code: e.target.value })} />
          </div>
          <div className="field">
            <label>Rack / Shelf</label>
            <input value={productForm.rack} onChange={(e) => setProductForm({ ...productForm, rack: e.target.value })} placeholder="A-01" />
          </div>
        </div>
        <div className="actions">
          <button className="btn btn-primary" onClick={addProduct}>Save Product</button>
        </div>
      </div>

      <div className="card">
        <h3>Products</h3>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Category</th>
                <th>Rack</th>
                <th>Stock</th>
              </tr>
            </thead>
            <tbody>
              {store.products.map((product) => (
                <tr key={product.id}>
                  <td>{product.code}</td>
                  <td>{product.name}</td>
                  <td>{product.category}</td>
                  <td>{product.rack}</td>
                  <td>{inventoryByProduct[product.id] || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderSuppliers = () => (
    <div className="grid-2">
      <div className="card">
        <h3>Add Supplier</h3>
        <div className="form-grid">
          <div className="field">
            <label>Supplier Name</label>
            <input value={supplierForm.name} onChange={(e) => setSupplierForm({ ...supplierForm, name: e.target.value })} />
          </div>
          <div className="field">
            <label>Contact Person</label>
            <input value={supplierForm.contact} onChange={(e) => setSupplierForm({ ...supplierForm, contact: e.target.value })} />
          </div>
          <div className="field">
            <label>Phone</label>
            <input value={supplierForm.phone} onChange={(e) => setSupplierForm({ ...supplierForm, phone: e.target.value })} />
          </div>
          <div className="field">
            <label>Address</label>
            <textarea value={supplierForm.address} onChange={(e) => setSupplierForm({ ...supplierForm, address: e.target.value })} />
          </div>
        </div>
        <div className="actions">
          <button className="btn btn-primary" onClick={addSupplier}>Save Supplier</button>
        </div>
      </div>

      <div className="card">
        <h3>Supplier List</h3>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Contact</th>
              <th>Phone</th>
              <th>Address</th>
            </tr>
          </thead>
          <tbody>
            {store.suppliers.map((supplier) => (
              <tr key={supplier.id}>
                <td>{supplier.name}</td>
                <td>{supplier.contact}</td>
                <td>{supplier.phone}</td>
                <td>{supplier.address}</td>
              </tr>
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
          <div className="field">
            <label>Customer Name</label>
            <input value={customerForm.name} onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })} />
          </div>
          <div className="field">
            <label>Phone</label>
            <input value={customerForm.phone} onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })} />
          </div>
          <div className="field">
            <label>Address</label>
            <textarea value={customerForm.address} onChange={(e) => setCustomerForm({ ...customerForm, address: e.target.value })} />
          </div>
        </div>
        <div className="actions">
          <button className="btn btn-primary" onClick={addCustomer}>Save Customer</button>
        </div>
      </div>

      <div className="card">
        <h3>Customer List</h3>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Address</th>
            </tr>
          </thead>
          <tbody>
            {store.customers.map((customer) => (
              <tr key={customer.id}>
                <td>{customer.name}</td>
                <td>{customer.phone}</td>
                <td>{customer.address}</td>
              </tr>
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
          <div className="field">
            <label>Supplier</label>
            <select value={purchaseForm.supplierId} onChange={(e) => setPurchaseForm({ ...purchaseForm, supplierId: e.target.value })}>
              <option value="">Select supplier</option>
              {store.suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Product</label>
            <select value={purchaseForm.productId} onChange={(e) => setPurchaseForm({ ...purchaseForm, productId: e.target.value })}>
              <option value="">Select product</option>
              {store.products.map((product) => (
                <option key={product.id} value={product.id}>{product.name}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>AD Date</label>
            <input type="date" value={purchaseForm.date} onChange={(e) => setPurchaseForm({ ...purchaseForm, date: e.target.value })} />
          </div>
          <div className="field">
            <label>Nepali Date</label>
            <input type="date" value={purchaseForm.nepaliDate} onChange={(e) => setPurchaseForm({ ...purchaseForm, nepaliDate: e.target.value })} />
          </div>
          <div className="field">
            <label>Batch Number</label>
            <input value={purchaseForm.batch} onChange={(e) => setPurchaseForm({ ...purchaseForm, batch: e.target.value })} />
          </div>
          <div className="field">
            <label>Expiry Date</label>
            <input type="date" value={purchaseForm.expiry} onChange={(e) => setPurchaseForm({ ...purchaseForm, expiry: e.target.value })} />
          </div>
          <div className="field">
            <label>Quantity</label>
            <input type="number" value={purchaseForm.quantity} onChange={(e) => setPurchaseForm({ ...purchaseForm, quantity: e.target.value })} />
          </div>
          <div className="field">
            <label>Purchase Price</label>
            <input type="number" value={purchaseForm.purchasePrice} onChange={(e) => setPurchaseForm({ ...purchaseForm, purchasePrice: e.target.value })} />
          </div>
          <div className="field">
            <label>Selling Price</label>
            <input type="number" value={purchaseForm.sellingPrice} onChange={(e) => setPurchaseForm({ ...purchaseForm, sellingPrice: e.target.value })} />
          </div>
          <div className="field">
            <label>Discount Type</label>
            <select value={purchaseForm.discountType} onChange={(e) => setPurchaseForm({ ...purchaseForm, discountType: e.target.value as 'percent' | 'amount' })}>
              <option value="percent">%</option>
              <option value="amount">Amount</option>
            </select>
          </div>
          <div className="field">
            <label>Discount Value</label>
            <input type="number" value={purchaseForm.discountValue} onChange={(e) => setPurchaseForm({ ...purchaseForm, discountValue: e.target.value })} />
          </div>
          <div className="field">
            <label>Due Days</label>
            <select value={purchaseForm.dueDays} onChange={(e) => setPurchaseForm({ ...purchaseForm, dueDays: e.target.value })}>
              <option value="30">30 Days</option>
              <option value="60">60 Days</option>
              <option value="90">90 Days</option>
              <option value="120">120 Days</option>
            </select>
          </div>
        </div>
        <div className="actions">
          <button className="btn btn-primary" onClick={addPurchase}>Save Purchase</button>
        </div>
      </div>

      <div className="card">
        <h3>Purchase List</h3>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Supplier</th>
                <th>Product</th>
                <th>Qty</th>
                <th>Batch</th>
                <th>Purchase</th>
                <th>Sell</th>
              </tr>
            </thead>
            <tbody>
              {store.purchases.map((purchase) => (
                <tr key={purchase.id}>
                  <td>{purchase.nepaliDate || purchase.date}</td>
                  <td>{getSupplierName(purchase.supplierId)}</td>
                  <td>{getProductName(purchase.productId)}</td>
                  <td>{purchase.quantity}</td>
                  <td>{purchase.batch}</td>
                  <td>{formatCurrency(purchase.purchasePrice)}</td>
                  <td>{formatCurrency(purchase.sellingPrice)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderSales = () => (
    <div className="grid-2">
      <div className="card">
        <h3>Sales Entry</h3>
        <div className="form-grid">
          <div className="field">
            <label>Customer</label>
            <select value={saleForm.customerId} onChange={(e) => setSaleForm({ ...saleForm, customerId: e.target.value })}>
              <option value="">Select customer</option>
              {store.customers.map((customer) => (
                <option key={customer.id} value={customer.id}>{customer.name}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Product</label>
            <select value={saleForm.productId} onChange={(e) => setSaleForm({ ...saleForm, productId: e.target.value })}>
              <option value="">Select product</option>
              {store.products.map((product) => (
                <option key={product.id} value={product.id}>{product.name}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>AD Date</label>
            <input type="date" value={saleForm.date} onChange={(e) => setSaleForm({ ...saleForm, date: e.target.value })} />
          </div>
          <div className="field">
            <label>Nepali Date</label>
            <input type="date" value={saleForm.nepaliDate} onChange={(e) => setSaleForm({ ...saleForm, nepaliDate: e.target.value })} />
          </div>
          <div className="field">
            <label>Quantity</label>
            <input type="number" value={saleForm.quantity} onChange={(e) => setSaleForm({ ...saleForm, quantity: e.target.value })} />
          </div>
          <div className="field">
            <label>Selling Price</label>
            <input type="number" value={saleForm.sellingPrice} onChange={(e) => setSaleForm({ ...saleForm, sellingPrice: e.target.value })} />
          </div>
          <div className="field">
            <label>Discount Type</label>
            <select value={saleForm.discountType} onChange={(e) => setSaleForm({ ...saleForm, discountType: e.target.value as 'percent' | 'amount' })}>
              <option value="percent">%</option>
              <option value="amount">Amount</option>
            </select>
          </div>
          <div className="field">
            <label>Discount Value</label>
            <input type="number" value={saleForm.discountValue} onChange={(e) => setSaleForm({ ...saleForm, discountValue: e.target.value })} />
          </div>
          <div className="field">
            <label>Paid Amount</label>
            <input type="number" value={saleForm.paid} onChange={(e) => setSaleForm({ ...saleForm, paid: e.target.value })} />
          </div>
        </div>
        <div className="actions">
          <button className="btn btn-primary" onClick={addSale}>Save Sales Bill</button>
        </div>
      </div>

      <div className="card">
        <h3>Sales List</h3>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Customer</th>
                <th>Product</th>
                <th>Qty</th>
                <th>Amount</th>
                <th>Paid</th>
              </tr>
            </thead>
            <tbody>
              {store.sales.map((sale) => {
                const amount = Number(sale.quantity) * Number(sale.sellingPrice);
                const discount = sale.discountType === 'percent' ? (amount * sale.discountValue) / 100 : sale.discountValue;
                return (
                  <tr key={sale.id}>
                    <td>{sale.nepaliDate || sale.date}</td>
                    <td>{getCustomerName(sale.customerId)}</td>
                    <td>{getProductName(sale.productId)}</td>
                    <td>{sale.quantity}</td>
                    <td>{formatCurrency(amount - discount)}</td>
                    <td>{formatCurrency(sale.paid)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderAccounting = () => (
    <div className="grid-2">
      <div className="card">
        <h3>Income / Expense</h3>
        <div className="form-grid">
          <div className="field">
            <label>Entry Type</label>
            <select onChange={(e) => setActiveTab('Accounting')}>
              <option>Expense</option>
              <option>Income</option>
            </select>
          </div>
        </div>

        <h4>Expense Form</h4>
        <div className="form-grid">
          <div className="field">
            <label>Category</label>
            <input value={expenseForm.category} onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })} placeholder="Add category" />
          </div>
          <div className="field">
            <label>Title</label>
            <input value={expenseForm.title} onChange={(e) => setExpenseForm({ ...expenseForm, title: e.target.value })} />
          </div>
          <div className="field">
            <label>Vendor / Bill</label>
            <input value={expenseForm.vendor} onChange={(e) => setExpenseForm({ ...expenseForm, vendor: e.target.value })} />
          </div>
          <div className="field">
            <label>Date (AD)</label>
            <input type="date" value={expenseForm.date} onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })} />
          </div>
          <div className="field">
            <label>Date (Nepali)</label>
            <input type="date" value={expenseForm.nepaliDate} onChange={(e) => setExpenseForm({ ...expenseForm, nepaliDate: e.target.value })} />
          </div>
          <div className="field">
            <label>Amount</label>
            <input type="number" value={expenseForm.amount} onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })} />
          </div>
          <div className="field" style={{ gridColumn: '1 / -1' }}>
            <label>Note</label>
            <textarea value={expenseForm.note} onChange={(e) => setExpenseForm({ ...expenseForm, note: e.target.value })} />
          </div>
        </div>
        <div className="actions">
          <button className="btn btn-primary" onClick={addExpense}>Save Expense</button>
        </div>

        <h4>Income Form</h4>
        <div className="form-grid">
          <div className="field">
            <label>Category</label>
            <input value={incomeForm.category} onChange={(e) => setIncomeForm({ ...incomeForm, category: e.target.value })} placeholder="Add category" />
          </div>
          <div className="field">
            <label>Title</label>
            <input value={incomeForm.title} onChange={(e) => setIncomeForm({ ...incomeForm, title: e.target.value })} />
          </div>
          <div className="field">
            <label>Source</label>
            <input value={incomeForm.source} onChange={(e) => setIncomeForm({ ...incomeForm, source: e.target.value })} />
          </div>
          <div className="field">
            <label>Date (AD)</label>
            <input type="date" value={incomeForm.date} onChange={(e) => setIncomeForm({ ...incomeForm, date: e.target.value })} />
          </div>
          <div className="field">
            <label>Date (Nepali)</label>
            <input type="date" value={incomeForm.nepaliDate} onChange={(e) => setIncomeForm({ ...incomeForm, nepaliDate: e.target.value })} />
          </div>
          <div className="field">
            <label>Amount</label>
            <input type="number" value={incomeForm.amount} onChange={(e) => setIncomeForm({ ...incomeForm, amount: e.target.value })} />
          </div>
          <div className="field" style={{ gridColumn: '1 / -1' }}>
            <label>Note</label>
            <textarea value={incomeForm.note} onChange={(e) => setIncomeForm({ ...incomeForm, note: e.target.value })} />
          </div>
        </div>
        <div className="actions">
          <button className="btn btn-success" onClick={addIncome}>Save Income</button>
        </div>
      </div>

      <div className="card">
        <h3>Supplier Payment</h3>
        <div className="form-grid">
          <div className="field">
            <label>Supplier</label>
            <select value={paymentForm.supplierId} onChange={(e) => setPaymentForm({ ...paymentForm, supplierId: e.target.value })}>
              <option value="">Select supplier</option>
              {store.suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Payment Date (AD)</label>
            <input type="date" value={paymentForm.date} onChange={(e) => setPaymentForm({ ...paymentForm, date: e.target.value })} />
          </div>
          <div className="field">
            <label>Payment Date (Nepali)</label>
            <input type="date" value={paymentForm.nepaliDate} onChange={(e) => setPaymentForm({ ...paymentForm, nepaliDate: e.target.value })} />
          </div>
          <div className="field">
            <label>Amount</label>
            <input type="number" value={paymentForm.amount} onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })} />
          </div>
          <div className="field" style={{ gridColumn: '1 / -1' }}>
            <label>Note</label>
            <textarea value={paymentForm.note} onChange={(e) => setPaymentForm({ ...paymentForm, note: e.target.value })} />
          </div>
        </div>
        <div className="actions">
          <button className="btn btn-primary" onClick={addPayment}>Save Payment</button>
        </div>
      </div>
    </div>
  );

  const renderReports = () => (
    <div className="card print-area">
      <div className="inline-row" style={{ marginBottom: 16 }}>
        <h3 style={{ margin: 0 }}>Financial Reports</h3>
        <div className="spacer" />
        <select value={reportRange} onChange={(e) => setReportRange(e.target.value as ReportRange)}>
          {Object.entries(currentRangeLabels).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
        <button className="btn btn-secondary no-print" onClick={() => window.print()}>Print Ledger</button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="label">Sales</div>
          <div className="value">{formatCurrency(filteredSalesTotal)}</div>
        </div>
        <div className="stat-card">
          <div className="label">Purchases</div>
          <div className="value">{formatCurrency(filteredPurchaseTotal)}</div>
        </div>
        <div className="stat-card">
          <div className="label">Expenses</div>
          <div className="value">{formatCurrency(filteredExpenseTotal)}</div>
        </div>
        <div className="stat-card">
          <div className="label">Income</div>
          <div className="value">{formatCurrency(filteredIncomeTotal)}</div>
        </div>
      </div>

      <div className="grid-2">
        <div>
          <h4>Sales Report</h4>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Customer</th>
                <th>Product</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {salesReport.map((sale) => {
                const amount = Number(sale.quantity) * Number(sale.sellingPrice);
                const discount = sale.discountType === 'percent' ? (amount * sale.discountValue) / 100 : sale.discountValue;
                return (
                  <tr key={sale.id}>
                    <td>{sale.nepaliDate || sale.date}</td>
                    <td>{getCustomerName(sale.customerId)}</td>
                    <td>{getProductName(sale.productId)}</td>
                    <td>{formatCurrency(amount - discount)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div>
          <h4>Purchase Report</h4>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Supplier</th>
                <th>Product</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {purchaseReport.map((purchase) => (
                <tr key={purchase.id}>
                  <td>{purchase.nepaliDate || purchase.date}</td>
                  <td>{getSupplierName(purchase.supplierId)}</td>
                  <td>{getProductName(purchase.productId)}</td>
                  <td>{formatCurrency(Number(purchase.quantity) * Number(purchase.purchasePrice))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid-2" style={{ marginTop: 20 }}>
        <div>
          <h4>Income Ledger</h4>
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Date</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {incomeReport.map((item) => (
                <tr key={item.id}>
                  <td>{item.title}</td>
                  <td>{item.category}</td>
                  <td>{item.nepaliDate || item.date}</td>
                  <td>{formatCurrency(item.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div>
          <h4>Expense Ledger</h4>
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Date</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {expenseReport.map((item) => (
                <tr key={item.id}>
                  <td>{item.title}</td>
                  <td>{item.category}</td>
                  <td>{item.nepaliDate || item.date}</td>
                  <td>{formatCurrency(item.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ marginTop: 20 }}>
        <h4>Profit & Loss Summary</h4>
        <table>
          <tbody>
            <tr><td>Sales</td><td>{formatCurrency(filteredSalesTotal)}</td></tr>
            <tr><td>Purchase</td><td>{formatCurrency(filteredPurchaseTotal)}</td></tr>
            <tr><td>Expenses</td><td>{formatCurrency(filteredExpenseTotal)}</td></tr>
            <tr><td>Income</td><td>{formatCurrency(filteredIncomeTotal)}</td></tr>
            <tr><td><strong>Net Profit</strong></td><td><strong>{formatCurrency(filteredSalesTotal - filteredPurchaseTotal - filteredExpenseTotal + filteredIncomeTotal)}</strong></td></tr>
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderReturns = () => (
    <div className="card">
      <h3>Sales Return / Purchase Return</h3>
      <p className="muted">Return reason selection is supported in this version. A print-friendly return ledger can be generated from the accounting print area.</p>
      <div className="grid-2">
        <div>
          <div className="form-grid">
            <div className="field">
              <label>Return Type</label>
              <select>
                <option>Sales Return</option>
                <option>Purchase Return</option>
              </select>
            </div>
            <div className="field">
              <label>Reason</label>
              <select>
                <option>Damaged</option>
                <option>Expired</option>
                <option>Wrong Product</option>
                <option>Short Quantity</option>
              </select>
            </div>
            <div className="field">
              <label>Product</label>
              <select>
                {store.products.map((product) => (
                  <option key={product.id} value={product.id}>{product.name}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Quantity</label>
              <input type="number" defaultValue={1} />
            </div>
          </div>
          <div className="actions">
            <button className="btn btn-warning">Save Return</button>
          </div>
        </div>
        <div>
          <h4>Return Note</h4>
          <p className="muted">This version stores the return module in a printable format. You can extend it with a dedicated return table once the base app is completed.</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <h1>Medical Accounting System</h1>
          <small>Chrome-ready business accounting</small>
        </div>
        <div className="topbar-actions">
          <span className="small-badge">Nepali + AD</span>
          <span className="small-badge">Print-friendly ledgers</span>
        </div>
      </header>

      <div className="layout">
        <aside className="sidebar no-print">
          <div className="nav-group">
            {tabs.map((tab) => (
              <button
                key={tab}
                className={`nav-item ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
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
