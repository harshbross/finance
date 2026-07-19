'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';
import { 
  ShieldAlert, LayoutDashboard, Plus, Trash2, Edit, Save, 
  Users, ShoppingBag, FolderTree, Receipt, TrendingUp, X, Upload 
} from 'lucide-react';
import styles from './Admin.module.css';

interface StatCounts {
  users: number;
  products: number;
  categories: number;
  orders: number;
}

interface DashboardStats {
  counts: StatCounts;
  totalRevenue: number;
  latestOrders: any[];
}

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
  imageUrl: string;
  description: string;
  categoryId: number;
  category: { name: string };
}

interface Category {
  id: number;
  name: string;
}

interface UserInfo {
  id: number;
  name: string;
  email: string;
  role: string;
  address: string | null;
  createdAt: string;
}

interface OrderInfo {
  id: number;
  totalAmount: number;
  status: string;
  shippingAddress: string;
  createdAt: string;
  user: { name: string; email: string };
  items: any[];
}

type TabType = 'overview' | 'products' | 'categories' | 'orders' | 'users';

export default function AdminDashboardPage() {
  const { user, token, apiUrl } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  // Stats State
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Products State
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productForm, setProductForm] = useState({
    id: 0,
    name: '',
    description: '',
    price: '',
    stock: '',
    categoryId: '',
    imageUrl: ''
  });
  const [isEditingProduct, setIsEditingProduct] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Categories State
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [categoryName, setCategoryName] = useState('');
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState('');

  // Orders State
  const [orders, setOrders] = useState<OrderInfo[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Users State
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // General Notification Alert
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const triggerAlert = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  };

  // Redirect or block if not admin
  const isAuthorized = user && user.role === 'ADMIN';

  // Fetch Dashboard Stats
  const fetchStats = async () => {
    if (!token) return;
    setLoadingStats(true);
    try {
      const res = await fetch(`${apiUrl}/api/admin/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Failed to load admin stats', err);
    } finally {
      setLoadingStats(false);
    }
  };

  // Fetch All Products
  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const res = await fetch(`${apiUrl}/api/products?limit=100`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
      }
    } catch (err) {
      console.error('Failed to load products', err);
    } finally {
      setLoadingProducts(false);
    }
  };

  // Fetch All Categories
  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      const res = await fetch(`${apiUrl}/api/categories`);
      if (res.ok) {
        const data = await res.json();
        setCategories(data || []);
      }
    } catch (err) {
      console.error('Failed to load categories', err);
    } finally {
      setLoadingCategories(false);
    }
  };

  // Fetch All Orders
  const fetchOrders = async () => {
    if (!token) return;
    setLoadingOrders(true);
    try {
      const res = await fetch(`${apiUrl}/api/orders/admin/all`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data || []);
      }
    } catch (err) {
      console.error('Failed to load orders', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  // Fetch All Users
  const fetchUsers = async () => {
    if (!token) return;
    setLoadingUsers(true);
    try {
      const res = await fetch(`${apiUrl}/api/admin/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data || []);
      }
    } catch (err) {
      console.error('Failed to load users', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Switch tabs loader
  useEffect(() => {
    if (!token || !isAuthorized) return;
    if (activeTab === 'overview') {
      fetchStats();
    } else if (activeTab === 'products') {
      fetchProducts();
      fetchCategories();
    } else if (activeTab === 'categories') {
      fetchCategories();
    } else if (activeTab === 'orders') {
      fetchOrders();
    } else if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab, token, isAuthorized]);

  // Handle Product Image Upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    setUploadingImage(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch(`${apiUrl}/api/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        setProductForm(prev => ({ ...prev, imageUrl: data.imageUrl }));
        triggerAlert('Image uploaded successfully!', 'success');
      } else {
        triggerAlert(data.message || 'Image upload failed', 'error');
      }
    } catch (err) {
      triggerAlert('Network error uploading image', 'error');
    } finally {
      setUploadingImage(false);
    }
  };

  // Handle Product Form Submit
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name || !productForm.price || !productForm.stock || !productForm.categoryId || !productForm.imageUrl) {
      triggerAlert('Please fill in all required product fields', 'error');
      return;
    }

    const payload = {
      name: productForm.name,
      description: productForm.description,
      price: parseFloat(productForm.price),
      stock: parseInt(productForm.stock),
      categoryId: parseInt(productForm.categoryId),
      imageUrl: productForm.imageUrl
    };

    try {
      let res;
      if (isEditingProduct) {
        res = await fetch(`${apiUrl}/api/products/${productForm.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch(`${apiUrl}/api/products`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
      }

      const data = await res.json();
      if (res.ok) {
        triggerAlert(`Product ${isEditingProduct ? 'updated' : 'created'} successfully!`, 'success');
        setIsEditingProduct(false);
        setProductForm({ id: 0, name: '', description: '', price: '', stock: '', categoryId: '', imageUrl: '' });
        fetchProducts();
      } else {
        triggerAlert(data.message || 'Product action failed', 'error');
      }
    } catch (err) {
      triggerAlert('Server error updating products', 'error');
    }
  };

  // Delete Product
  const handleDeleteProduct = async (id: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await fetch(`${apiUrl}/api/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        triggerAlert('Product deleted successfully', 'success');
        fetchProducts();
      } else {
        const data = await res.json();
        triggerAlert(data.message || 'Delete product failed', 'error');
      }
    } catch (err) {
      triggerAlert('Server error deleting product', 'error');
    }
  };

  // Start Edit Product
  const handleEditProduct = (prod: Product) => {
    setIsEditingProduct(true);
    setProductForm({
      id: prod.id,
      name: prod.name,
      description: prod.description || '',
      price: prod.price.toString(),
      stock: prod.stock.toString(),
      categoryId: prod.categoryId.toString(),
      imageUrl: prod.imageUrl
    });
  };

  // Create Category
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryName) return;
    try {
      const res = await fetch(`${apiUrl}/api/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: categoryName })
      });
      if (res.ok) {
        triggerAlert('Category created successfully!', 'success');
        setCategoryName('');
        fetchCategories();
      } else {
        const data = await res.json();
        triggerAlert(data.message || 'Failed to create category', 'error');
      }
    } catch (err) {
      triggerAlert('Server error creating category', 'error');
    }
  };

  // Delete Category
  const handleDeleteCategory = async (id: number) => {
    if (!confirm('Are you sure you want to delete this category? All products under it will be deleted.')) return;
    try {
      const res = await fetch(`${apiUrl}/api/categories/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        triggerAlert('Category deleted successfully', 'success');
        fetchCategories();
      } else {
        const data = await res.json();
        triggerAlert(data.message || 'Failed to delete category', 'error');
      }
    } catch (err) {
      triggerAlert('Server error deleting category', 'error');
    }
  };

  // Update Category Name (Inline)
  const handleSaveCategoryEdit = async (id: number) => {
    if (!editingCategoryName) return;
    try {
      const res = await fetch(`${apiUrl}/api/categories/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: editingCategoryName })
      });
      if (res.ok) {
        triggerAlert('Category updated successfully!', 'success');
        setEditingCategoryId(null);
        fetchCategories();
      } else {
        const data = await res.json();
        triggerAlert(data.message || 'Failed to update category', 'error');
      }
    } catch (err) {
      triggerAlert('Server error updating category', 'error');
    }
  };

  // Update Order Status
  const handleOrderStatusChange = async (orderId: number, status: string) => {
    try {
      const res = await fetch(`${apiUrl}/api/orders/admin/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        triggerAlert(`Order #${orderId} status set to ${status}`, 'success');
        fetchOrders();
      } else {
        const data = await res.json();
        triggerAlert(data.message || 'Failed to update status', 'error');
      }
    } catch (err) {
      triggerAlert('Server error updating order status', 'error');
    }
  };

  // Block unauthorized view
  if (!token || !isAuthorized) {
    return (
      <div className={`${styles.accessDenied} glass-panel fade-in`}>
        <ShieldAlert size={48} className={styles.deniedIcon} />
        <h2>Access Denied</h2>
        <p>This path is restricted to Store Managers / Administrators. Please log in with an admin account.</p>
        <div style={{ marginTop: '20px', display: 'flex', gap: '12px' }}>
          <Link href="/login" className="btn-primary">Sign In</Link>
          <Link href="/" className="btn-secondary">Back Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.adminLayout} fade-in`}>
      {/* Sidebar Navigation */}
      <aside className={`${styles.sidebar} glass-panel`}>
        <div className={styles.adminProfile}>
          <LayoutDashboard size={24} className={styles.logoIcon} />
          <div>
            <h3>Admin Portal</h3>
            <p>{user.name}</p>
          </div>
        </div>

        <div className={styles.navMenu}>
          <button 
            className={`${styles.navBtn} ${activeTab === 'overview' ? styles.active : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <TrendingUp size={18} />
            Overview
          </button>
          <button 
            className={`${styles.navBtn} ${activeTab === 'products' ? styles.active : ''}`}
            onClick={() => setActiveTab('products')}
          >
            <ShoppingBag size={18} />
            Products CRUD
          </button>
          <button 
            className={`${styles.navBtn} ${activeTab === 'categories' ? styles.active : ''}`}
            onClick={() => setActiveTab('categories')}
          >
            <FolderTree size={18} />
            Categories CRUD
          </button>
          <button 
            className={`${styles.navBtn} ${activeTab === 'orders' ? styles.active : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <Receipt size={18} />
            All Orders
          </button>
          <button 
            className={`${styles.navBtn} ${activeTab === 'users' ? styles.active : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <Users size={18} />
            Users List
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={styles.mainContent}>
        {message && (
          <div className={`${styles.toast} badge ${message.type === 'success' ? 'badge-success' : 'badge-error'}`}>
            {message.text}
          </div>
        )}

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div>
            <h2 className={styles.tabTitle}>Dashboard Overview</h2>
            {loadingStats ? (
              <div className="text-center p-8">Loading stats...</div>
            ) : stats ? (
              <>
                {/* Stats cards */}
                <div className={styles.statsGrid}>
                  <div className="glass-card p-6 flex justify-between items-center">
                    <div>
                      <p className={styles.cardLabel}>Total Revenue</p>
                      <h3 className={styles.cardValue}>${stats.totalRevenue.toFixed(2)}</h3>
                    </div>
                    <div className={styles.statIconWrap} style={{ borderColor: 'var(--accent-secondary)' }}>
                      <TrendingUp className={styles.statIcon} style={{ color: 'var(--accent-secondary)' }} />
                    </div>
                  </div>
                  <div className="glass-card p-6 flex justify-between items-center">
                    <div>
                      <p className={styles.cardLabel}>Orders Placed</p>
                      <h3 className={styles.cardValue}>{stats.counts.orders}</h3>
                    </div>
                    <div className={styles.statIconWrap}>
                      <Receipt className={styles.statIcon} />
                    </div>
                  </div>
                  <div className="glass-card p-6 flex justify-between items-center">
                    <div>
                      <p className={styles.cardLabel}>Catalog Items</p>
                      <h3 className={styles.cardValue}>{stats.counts.products}</h3>
                    </div>
                    <div className={styles.statIconWrap} style={{ borderColor: 'var(--accent-tertiary)' }}>
                      <ShoppingBag className={styles.statIcon} style={{ color: 'var(--accent-tertiary)' }} />
                    </div>
                  </div>
                  <div className="glass-card p-6 flex justify-between items-center">
                    <div>
                      <p className={styles.cardLabel}>Registered Users</p>
                      <h3 className={styles.cardValue}>{stats.counts.users}</h3>
                    </div>
                    <div className={styles.statIconWrap}>
                      <Users className={styles.statIcon} />
                    </div>
                  </div>
                </div>

                {/* Latest orders table */}
                <div className={`${styles.tableCard} glass-panel`} style={{ marginTop: '30px' }}>
                  <h3>Latest Orders</h3>
                  <div className={styles.divider}></div>
                  {stats.latestOrders.length > 0 ? (
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Customer</th>
                          <th>Total Amount</th>
                          <th>Status</th>
                          <th>Placed On</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.latestOrders.map((ord: any) => (
                          <tr key={ord.id}>
                            <td>#{ord.id}</td>
                            <td>
                              <p className={styles.tblName}>{ord.user.name}</p>
                              <span className={styles.tblEmail}>{ord.user.email}</span>
                            </td>
                            <td style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>
                              ${ord.totalAmount.toFixed(2)}
                            </td>
                            <td>
                              <span className={`badge ${
                                ord.status === 'Delivered' ? 'badge-success' :
                                ord.status === 'Cancelled' ? 'badge-error' : 'badge-primary'
                              }`}>
                                {ord.status}
                              </span>
                            </td>
                            <td>{new Date(ord.createdAt).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p className="text-center p-6 color-muted">No orders found.</p>
                  )}
                </div>
              </>
            ) : (
              <p>Failed to retrieve stats.</p>
            )}
          </div>
        )}

        {/* PRODUCTS CRUD TAB */}
        {activeTab === 'products' && (
          <div>
            <div className={styles.tabHeader}>
              <h2 className={styles.tabTitle}>Manage Catalog Products</h2>
              <button 
                className="btn-primary" 
                onClick={() => {
                  setIsEditingProduct(false);
                  setProductForm({ id: 0, name: '', description: '', price: '', stock: '', categoryId: '', imageUrl: '' });
                }}
              >
                <Plus size={18} />
                Create New Product
              </button>
            </div>

            {/* Create/Edit Form Container */}
            <div className={`${styles.formCard} glass-panel`} style={{ marginBottom: '30px' }}>
              <h3>{isEditingProduct ? `Edit Product #${productForm.id}` : 'Create New Product'}</h3>
              <div className={styles.divider}></div>
              
              <form onSubmit={handleProductSubmit} className={styles.formGrid}>
                <div className="form-group">
                  <label className="form-label">Product Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Aether Core Laptop"
                    value={productForm.name}
                    onChange={(e) => setProductForm(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Category *</label>
                  <select
                    className="form-input"
                    value={productForm.categoryId}
                    onChange={(e) => setProductForm(prev => ({ ...prev, categoryId: e.target.value }))}
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-input"
                    placeholder="999.99"
                    value={productForm.price}
                    onChange={(e) => setProductForm(prev => ({ ...prev, price: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Stock Quantity *</label>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="15"
                    value={productForm.stock}
                    onChange={(e) => setProductForm(prev => ({ ...prev, stock: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-input"
                    rows={2}
                    placeholder="Detailed specifications and capabilities..."
                    value={productForm.description}
                    onChange={(e) => setProductForm(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Product Image URL *</label>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <input
                      type="text"
                      className="form-input"
                      style={{ flex: 1 }}
                      placeholder="Upload via right button or input direct HTTP link"
                      value={productForm.imageUrl}
                      onChange={(e) => setProductForm(prev => ({ ...prev, imageUrl: e.target.value }))}
                      required
                    />
                    <label className="btn-secondary" style={{ cursor: 'pointer', padding: '12px 16px' }}>
                      <Upload size={18} />
                      {uploadingImage ? 'Uploading...' : 'Upload Image'}
                      <input
                        type="file"
                        style={{ display: 'none' }}
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploadingImage}
                      />
                    </label>
                  </div>
                </div>

                <div style={{ gridColumn: 'span 2', display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px' }}>
                  <button type="submit" className="btn-primary">
                    <Save size={18} />
                    {isEditingProduct ? 'Update Product' : 'Add to Catalog'}
                  </button>
                  {isEditingProduct && (
                    <button 
                      type="button" 
                      className="btn-secondary"
                      onClick={() => {
                        setIsEditingProduct(false);
                        setProductForm({ id: 0, name: '', description: '', price: '', stock: '', categoryId: '', imageUrl: '' });
                      }}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Products Table */}
            <div className={`${styles.tableCard} glass-panel`}>
              <h3>Product Listings</h3>
              <div className={styles.divider}></div>
              {loadingProducts ? (
                <div className="text-center p-8">Loading products...</div>
              ) : products.length > 0 ? (
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Product Info</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((prod) => (
                      <tr key={prod.id}>
                        <td>
                          <div className={styles.tblImgWrap}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={prod.imageUrl} alt={prod.name} className={styles.tblImg} />
                          </div>
                        </td>
                        <td>
                          <p className={styles.tblName}>{prod.name}</p>
                          <span className={styles.tblEmail} style={{ display: 'inline-block', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {prod.description}
                          </span>
                        </td>
                        <td>
                          <span className="badge badge-secondary">{prod.category?.name}</span>
                        </td>
                        <td style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>
                          ${prod.price.toFixed(2)}
                        </td>
                        <td>
                          <span className={`badge ${prod.stock > 0 ? 'badge-success' : 'badge-error'}`}>
                            {prod.stock} items
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button className={styles.actionBtn} onClick={() => handleEditProduct(prod)} title="Edit">
                              <Edit size={16} />
                            </button>
                            <button className={`${styles.actionBtn} ${styles.actionBtnDanger}`} onClick={() => handleDeleteProduct(prod.id)} title="Delete">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-center p-6 color-muted">No products found. Add one above!</p>
              )}
            </div>

          </div>
        )}

        {/* CATEGORIES CRUD TAB */}
        {activeTab === 'categories' && (
          <div>
            <h2 className={styles.tabTitle}>Manage Categories</h2>
            
            {/* Create Category Form */}
            <div className={`${styles.formCard} glass-panel`} style={{ marginBottom: '30px', maxWidth: '500px' }}>
              <h3>Add New Category</h3>
              <div className={styles.divider}></div>
              <form onSubmit={handleCreateCategory} className="flex gap-4">
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Hardware, Peripheral"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  required
                />
                <button type="submit" className="btn-primary">
                  <Plus size={18} />
                  Add
                </button>
              </form>
            </div>

            {/* Categories list */}
            <div className={`${styles.tableCard} glass-panel`} style={{ maxWidth: '600px' }}>
              <h3>Category List</h3>
              <div className={styles.divider}></div>
              {loadingCategories ? (
                <div className="text-center p-8">Loading categories...</div>
              ) : categories.length > 0 ? (
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((cat) => (
                      <tr key={cat.id}>
                        <td>
                          {editingCategoryId === cat.id ? (
                            <input
                              type="text"
                              className="form-input"
                              value={editingCategoryName}
                              onChange={(e) => setEditingCategoryName(e.target.value)}
                              required
                            />
                          ) : (
                            <span className={styles.tblName}>{cat.name}</span>
                          )}
                        </td>
                        <td>
                          {editingCategoryId === cat.id ? (
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button className={styles.actionBtn} onClick={() => handleSaveCategoryEdit(cat.id)}>
                                <Save size={16} />
                              </button>
                              <button className={styles.actionBtn} onClick={() => setEditingCategoryId(null)}>
                                <X size={16} />
                              </button>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button 
                                className={styles.actionBtn} 
                                onClick={() => {
                                  setEditingCategoryId(cat.id);
                                  setEditingCategoryName(cat.name);
                                }}
                                title="Edit"
                              >
                                <Edit size={16} />
                              </button>
                              <button 
                                className={`${styles.actionBtn} ${styles.actionBtnDanger}`} 
                                onClick={() => handleDeleteCategory(cat.id)}
                                title="Delete"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-center p-6 color-muted">No categories created yet.</p>
              )}
            </div>

          </div>
        )}

        {/* ORDERS TAB */}
        {activeTab === 'orders' && (
          <div>
            <h2 className={styles.tabTitle}>All Platform Orders</h2>

            <div className={`${styles.tableCard} glass-panel`}>
              <h3>Orders Received</h3>
              <div className={styles.divider}></div>
              {loadingOrders ? (
                <div className="text-center p-8">Loading orders...</div>
              ) : orders.length > 0 ? (
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Customer Details</th>
                      <th>Shipping Address</th>
                      <th>Amount Paid</th>
                      <th>Order Status</th>
                      <th>Date Placed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((ord) => (
                      <tr key={ord.id}>
                        <td>#{ord.id}</td>
                        <td>
                          <p className={styles.tblName}>{ord.user.name}</p>
                          <span className={styles.tblEmail}>{ord.user.email}</span>
                        </td>
                        <td>
                          <span className={styles.tblEmail} style={{ display: 'inline-block', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={ord.shippingAddress}>
                            {ord.shippingAddress}
                          </span>
                        </td>
                        <td style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>
                          ${ord.totalAmount.toFixed(2)}
                        </td>
                        <td>
                          <select
                            className="form-input"
                            style={{ padding: '6px 12px', fontSize: '0.85rem', width: 'auto', display: 'inline-block', cursor: 'pointer' }}
                            value={ord.status}
                            onChange={(e) => handleOrderStatusChange(ord.id, e.target.value)}
                          >
                            <option value="Placed">Placed</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td>{new Date(ord.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-center p-6 color-muted">No customer orders found.</p>
              )}
            </div>

          </div>
        )}

        {/* USERS LIST TAB */}
        {activeTab === 'users' && (
          <div>
            <h2 className={styles.tabTitle}>Platform User Base</h2>

            <div className={`${styles.tableCard} glass-panel`}>
              <h3>Registered Accounts</h3>
              <div className={styles.divider}></div>
              {loadingUsers ? (
                <div className="text-center p-8">Loading user list...</div>
              ) : users.length > 0 ? (
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Email Address</th>
                      <th>Account Role</th>
                      <th>Default Address</th>
                      <th>Joined On</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((usr) => (
                      <tr key={usr.id}>
                        <td>#{usr.id}</td>
                        <td className={styles.tblName}>{usr.name}</td>
                        <td className={styles.tblEmail}>{usr.email}</td>
                        <td>
                          <span className={`badge ${usr.role === 'ADMIN' ? 'badge-primary' : 'badge-secondary'}`}>
                            {usr.role}
                          </span>
                        </td>
                        <td>
                          <span className={styles.tblEmail}>{usr.address || 'None saved'}</span>
                        </td>
                        <td>{new Date(usr.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-center p-6 color-muted">No accounts found.</p>
              )}
            </div>

          </div>
        )}

      </main>
    </div>
  );
}
