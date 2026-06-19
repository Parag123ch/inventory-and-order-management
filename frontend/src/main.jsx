import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { Boxes, LayoutDashboard, MinusCircle, PackagePlus, ShoppingCart, Trash2, Users } from "lucide-react";
import { api } from "./api";
import "./styles.css";

const tabs = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "products", label: "Products", icon: Boxes },
  { id: "customers", label: "Customers", icon: Users },
  { id: "orders", label: "Orders", icon: ShoppingCart },
];

const emptyProduct = { name: "", sku: "", price: "", quantity_in_stock: "" };
const emptyCustomer = { full_name: "", email: "", phone: "" };

function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [summary, setSummary] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    setError("");
    try {
      const [productData, customerData, orderData, dashboardData] = await Promise.all([
        api.products(),
        api.customers(),
        api.orders(),
        api.dashboard(),
      ]);
      setProducts(productData);
      setCustomers(customerData);
      setOrders(orderData);
      setSummary(dashboardData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const notify = (text) => {
    setMessage(text);
    setError("");
    setTimeout(() => setMessage(""), 3500);
  };

  const fail = (err) => {
    setError(err.message);
    setMessage("");
  };

  return (
    <main className="appShell">
      <aside className="sidebar">
        <div className="brand">
          <PackagePlus size={28} />
          <div>
            <strong>Inventory</strong>
            <span>Operations Console</span>
          </div>
        </div>
        <nav>
          {tabs.map(({ id, label, icon: Icon }) => (
            <button className={activeTab === id ? "active" : ""} key={id} onClick={() => setActiveTab(id)}>
              <Icon size={18} />
              {label}
            </button>
          ))}
        </nav>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <h1>{tabs.find((tab) => tab.id === activeTab)?.label}</h1>
            <p>Manage products, customers, orders, and live inventory levels.</p>
          </div>
          <button className="secondary" onClick={refresh} disabled={loading}>Refresh</button>
        </header>

        {message && <div className="notice success">{message}</div>}
        {error && <div className="notice error">{error}</div>}

        {activeTab === "dashboard" && <Dashboard summary={summary} loading={loading} />}
        {activeTab === "products" && (
          <Products products={products} onRefresh={refresh} onSuccess={notify} onError={fail} />
        )}
        {activeTab === "customers" && (
          <Customers customers={customers} onRefresh={refresh} onSuccess={notify} onError={fail} />
        )}
        {activeTab === "orders" && (
          <Orders products={products} customers={customers} orders={orders} onRefresh={refresh} onSuccess={notify} onError={fail} />
        )}
      </section>
    </main>
  );
}

function Dashboard({ summary, loading }) {
  if (loading) return <div className="panel">Loading dashboard...</div>;
  const cards = [
    ["Total Products", summary?.total_products ?? 0],
    ["Total Customers", summary?.total_customers ?? 0],
    ["Total Orders", summary?.total_orders ?? 0],
    ["Low Stock Items", summary?.low_stock_products?.length ?? 0],
  ];
  return (
    <>
      <div className="metrics">
        {cards.map(([label, value]) => (
          <article className="metric" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </article>
        ))}
      </div>
      <section className="panel">
        <h2>Low Stock Products</h2>
        <DataTable headers={["Name", "SKU", "Stock"]}>
          {(summary?.low_stock_products || []).map((product) => (
            <tr key={product.id}>
              <td>{product.name}</td>
              <td>{product.sku}</td>
              <td>{product.quantity_in_stock}</td>
            </tr>
          ))}
        </DataTable>
      </section>
    </>
  );
}

function Products({ products, onRefresh, onSuccess, onError }) {
  const [form, setForm] = useState(emptyProduct);
  const [editingId, setEditingId] = useState(null);

  const save = async (event) => {
    event.preventDefault();
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        quantity_in_stock: Number(form.quantity_in_stock),
      };
      if (editingId) {
        await api.updateProduct(editingId, payload);
        onSuccess("Product updated.");
      } else {
        await api.createProduct(payload);
        onSuccess("Product added.");
      }
      setForm(emptyProduct);
      setEditingId(null);
      await onRefresh();
    } catch (err) {
      onError(err);
    }
  };

  const edit = (product) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      sku: product.sku,
      price: product.price,
      quantity_in_stock: product.quantity_in_stock,
    });
  };

  const remove = async (id) => {
    try {
      await api.deleteProduct(id);
      onSuccess("Product deleted.");
      await onRefresh();
    } catch (err) {
      onError(err);
    }
  };

  return (
    <div className="twoColumn">
      <form className="panel formPanel" onSubmit={save}>
        <h2>{editingId ? "Update Product" : "Add Product"}</h2>
        <Field label="Product name" value={form.name} onChange={(value) => setForm({ ...form, name: value })} required />
        <Field label="SKU/code" value={form.sku} onChange={(value) => setForm({ ...form, sku: value })} required />
        <Field label="Price" type="number" min="0.01" step="0.01" value={form.price} onChange={(value) => setForm({ ...form, price: value })} required />
        <Field label="Quantity in stock" type="number" min="0" value={form.quantity_in_stock} onChange={(value) => setForm({ ...form, quantity_in_stock: value })} required />
        <button type="submit">{editingId ? "Save Changes" : "Add Product"}</button>
      </form>
      <section className="panel">
        <h2>Product List</h2>
        <DataTable headers={["Name", "SKU", "Price", "Stock", "Actions"]}>
          {products.map((product) => (
            <tr key={product.id}>
              <td>{product.name}</td>
              <td>{product.sku}</td>
              <td>${Number(product.price).toFixed(2)}</td>
              <td>{product.quantity_in_stock}</td>
              <td className="actions">
                <button className="secondary" onClick={() => edit(product)}>Edit</button>
                <IconButton label="Delete product" onClick={() => remove(product.id)}><Trash2 size={16} /></IconButton>
              </td>
            </tr>
          ))}
        </DataTable>
      </section>
    </div>
  );
}

function Customers({ customers, onRefresh, onSuccess, onError }) {
  const [form, setForm] = useState(emptyCustomer);

  const save = async (event) => {
    event.preventDefault();
    try {
      await api.createCustomer(form);
      setForm(emptyCustomer);
      onSuccess("Customer added.");
      await onRefresh();
    } catch (err) {
      onError(err);
    }
  };

  const remove = async (id) => {
    try {
      await api.deleteCustomer(id);
      onSuccess("Customer deleted.");
      await onRefresh();
    } catch (err) {
      onError(err);
    }
  };

  return (
    <div className="twoColumn">
      <form className="panel formPanel" onSubmit={save}>
        <h2>Add Customer</h2>
        <Field label="Full name" value={form.full_name} onChange={(value) => setForm({ ...form, full_name: value })} required />
        <Field label="Email address" type="email" value={form.email} onChange={(value) => setForm({ ...form, email: value })} required />
        <Field label="Phone number" value={form.phone} onChange={(value) => setForm({ ...form, phone: value })} required />
        <button type="submit">Add Customer</button>
      </form>
      <section className="panel">
        <h2>Customer List</h2>
        <DataTable headers={["Name", "Email", "Phone", "Actions"]}>
          {customers.map((customer) => (
            <tr key={customer.id}>
              <td>{customer.full_name}</td>
              <td>{customer.email}</td>
              <td>{customer.phone}</td>
              <td><IconButton label="Delete customer" onClick={() => remove(customer.id)}><Trash2 size={16} /></IconButton></td>
            </tr>
          ))}
        </DataTable>
      </section>
    </div>
  );
}

function Orders({ products, customers, orders, onRefresh, onSuccess, onError }) {
  const [customerId, setCustomerId] = useState("");
  const [lines, setLines] = useState([{ product_id: "", quantity: 1 }]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const totalPreview = useMemo(() => lines.reduce((sum, line) => {
    const product = products.find((item) => String(item.id) === String(line.product_id));
    return sum + (product ? Number(product.price) * Number(line.quantity || 0) : 0);
  }, 0), [lines, products]);

  const save = async (event) => {
    event.preventDefault();
    try {
      await api.createOrder({
        customer_id: Number(customerId),
        items: lines.map((line) => ({ product_id: Number(line.product_id), quantity: Number(line.quantity) })),
      });
      setCustomerId("");
      setLines([{ product_id: "", quantity: 1 }]);
      onSuccess("Order created and stock updated.");
      await onRefresh();
    } catch (err) {
      onError(err);
    }
  };

  const remove = async (id) => {
    try {
      await api.deleteOrder(id);
      onSuccess("Order deleted.");
      await onRefresh();
    } catch (err) {
      onError(err);
    }
  };

  const updateLine = (index, key, value) => {
    setLines(lines.map((line, current) => (current === index ? { ...line, [key]: value } : line)));
  };

  const removeLine = (index) => {
    if (lines.length === 1) return;
    setLines(lines.filter((_, current) => current !== index));
  };

  return (
    <div className="twoColumn">
      <form className="panel formPanel" onSubmit={save}>
        <h2>Create Order</h2>
        <label>
          Customer
          <select value={customerId} onChange={(event) => setCustomerId(event.target.value)} required>
            <option value="">Select customer</option>
            {customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.full_name}</option>)}
          </select>
        </label>
        {lines.map((line, index) => (
          <div className="orderLine" key={index}>
            <select value={line.product_id} onChange={(event) => updateLine(index, "product_id", event.target.value)} required>
              <option value="">Select product</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>{product.name} ({product.quantity_in_stock} in stock)</option>
              ))}
            </select>
            <input type="number" min="1" value={line.quantity} onChange={(event) => updateLine(index, "quantity", event.target.value)} required />
            <IconButton label="Remove order line" onClick={() => removeLine(index)} disabled={lines.length === 1}><MinusCircle size={16} /></IconButton>
          </div>
        ))}
        <button type="button" className="secondary" onClick={() => setLines([...lines, { product_id: "", quantity: 1 }])}>Add Line</button>
        <div className="totalPreview">Estimated total: ${totalPreview.toFixed(2)}</div>
        <button type="submit">Create Order</button>
      </form>
      <section className="panel">
        <h2>Orders</h2>
        <DataTable headers={["ID", "Customer", "Total", "Status", "Actions"]}>
          {orders.map((order) => (
            <tr key={order.id}>
              <td>#{order.id}</td>
              <td>{order.customer_name}</td>
              <td>${Number(order.total_amount).toFixed(2)}</td>
              <td>{order.status}</td>
              <td className="actions">
                <button className="secondary" onClick={() => setSelectedOrder(order)}>Details</button>
                <IconButton label="Delete order" onClick={() => remove(order.id)}><Trash2 size={16} /></IconButton>
              </td>
            </tr>
          ))}
        </DataTable>
        {selectedOrder && (
          <div className="details">
            <h3>Order #{selectedOrder.id}</h3>
            {selectedOrder.items.map((item) => (
              <p key={item.id}>{item.product_name}: {item.quantity} x ${Number(item.unit_price).toFixed(2)}</p>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Field({ label, onChange, ...props }) {
  return (
    <label>
      {label}
      <input {...props} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function DataTable({ headers, children }) {
  return (
    <div className="tableWrap">
      <table>
        <thead>
          <tr>{headers.map((header) => <th key={header}>{header}</th>)}</tr>
        </thead>
        <tbody>{React.Children.count(children) ? children : <tr><td colSpan={headers.length}>No records yet.</td></tr>}</tbody>
      </table>
    </div>
  );
}

function IconButton({ label, children, onClick, disabled = false }) {
  return <button className="iconButton" title={label} aria-label={label} onClick={onClick} disabled={disabled}>{children}</button>;
}

createRoot(document.getElementById("root")).render(<App />);
