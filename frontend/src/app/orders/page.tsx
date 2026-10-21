'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { Package, ArrowRight, ShoppingBag, Clock, CheckCircle2, Truck } from 'lucide-react';
import { formatPrice } from '../../utils/format';
import styles from './Orders.module.css';

interface Order {
  id: number;
  totalAmount: number;
  status: string;
  createdAt: string;
}

export default function OrdersPage() {
  const { token, apiUrl } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      if (!token) {
        setOrders([]);
        setLoading(false);
        return;
      }

      try {
        const endpoint = apiUrl ? `${apiUrl}/api/orders/my-orders` : '/api/orders/my-orders';
        const res = await fetch(endpoint, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setOrders(Array.isArray(data) ? data : []);
        } else {
          setOrders([]);
        }
      } catch (err) {
        console.error('Error loading orders', err);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, [token, apiUrl]);

  const getStatusBadge = (status: string) => {
    const s = status.toUpperCase();
    if (s === 'DELIVERED') {
      return (
        <span className="badge badge-success">
          <CheckCircle2 size={12} style={{ marginRight: 4 }} />
          Delivered
        </span>
      );
    }
    if (s === 'SHIPPED') {
      return (
        <span className="badge badge-primary">
          <Truck size={12} style={{ marginRight: 4 }} />
          Shipped
        </span>
      );
    }
    return (
      <span className="badge badge-secondary">
        <Clock size={12} style={{ marginRight: 4 }} />
        Processing
      </span>
    );
  };

  if (loading) {
    return <div className={styles.loader}>Loading orders...</div>;
  }

  return (
    <div className={`${styles.container} fade-in`}>
      <div className={styles.headerArea}>
        <h1 className={styles.title}>Orders & Procurement</h1>
        <p className={styles.subtitle}>Track your hardware shipments, order manifests, and invoices</p>
      </div>

      {orders.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <Package size={24} />
          </div>
          <h2 className={styles.emptyTitle}>No orders exist</h2>
          <p className={styles.emptyText}>
            You have not placed any orders yet. When you place an order, its details and shipment tracking will appear here.
          </p>
          <Link href="/products" className="btn-primary">
            Browse Hardware Catalog
            <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div className={styles.ordersList}>
          {orders.map((order) => (
            <div key={order.id} className={styles.orderCard}>
              <div className={styles.orderMeta}>
                <span className={styles.orderId}>Order #{order.id}</span>
                <span className={styles.orderDate}>
                  Placed on {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                </span>
              </div>

              <div className={styles.orderRight}>
                {getStatusBadge(order.status)}
                <span className={styles.orderPrice}>{formatPrice(order.totalAmount)}</span>
                <Link href={`/orders/${order.id}`} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8125rem' }}>
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
