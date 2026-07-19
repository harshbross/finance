'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { CheckCircle2, Package, MapPin, Calendar, Clock, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import styles from './OrderDetail.module.css';

interface OrderItem {
  id: number;
  productId: number;
  quantity: number;
  priceAtPurchase: number;
  product: {
    name: string;
    imageUrl: string;
  };
}

interface Order {
  id: number;
  totalAmount: number;
  status: string;
  shippingAddress: string;
  createdAt: string;
  items: OrderItem[];
}

export default function OrderDetailPage() {
  const { id } = useParams();
  const { token, apiUrl } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token && typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }, [token]);

  useEffect(() => {
    if (!id || !token) return;

    async function fetchOrder() {
      setLoading(true);
      try {
        const res = await fetch(`${apiUrl}/api/orders/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setOrder(data);
        } else {
          setOrder(null);
        }
      } catch (err) {
        console.error('Error loading order details', err);
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [id, token, apiUrl]);

  if (loading) {
    return <div className={styles.loader}>Loading order details...</div>;
  }

  if (!order) {
    return (
      <div className={`${styles.notFound} glass-panel`}>
        <h2>Order Not Found</h2>
        <p>The order you are looking for does not exist or you are not authorized to view it.</p>
        <Link href="/profile" className="btn-primary" style={{ marginTop: '16px' }}>
          Go to Profile
        </Link>
      </div>
    );
  }

  return (
    <div className={`${styles.container} fade-in`}>
      {/* Success banner */}
      <div className={`${styles.successHeader} glass-panel`}>
        <CheckCircle2 size={48} className={styles.successIcon} />
        <h1 className="glow-text">Order Confirmed!</h1>
        <p className={styles.orderIdText}>Order Reference ID: #{order.id}</p>
        <p className={styles.successSub}>Thank you for your purchase. We are preparing your order.</p>
      </div>

      <div className={styles.detailLayout}>
        {/* Order Info & Items List */}
        <div className={`${styles.itemsCard} glass-panel`}>
          <div className={styles.cardHeader}>
            <Package size={20} className={styles.headerIcon} />
            <h3>Items Ordered</h3>
          </div>
          <div className={styles.divider}></div>
          
          <div className={styles.itemsList}>
            {order.items.map((item) => (
              <div key={item.id} className={`${styles.orderItem} glass-card`}>
                <div className={styles.itemImageContainer}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.product.imageUrl} alt={item.product.name} className={item.product.imageUrl ? styles.itemImage : ''} />
                </div>
                <div className={styles.itemInfo}>
                  <p className={styles.itemName}>{item.product.name}</p>
                  <p className={styles.itemQtyPrice}>
                    Qty: {item.quantity} &times; ${item.priceAtPurchase.toFixed(2)}
                  </p>
                </div>
                <div className={styles.itemTotal}>
                  ${(item.priceAtPurchase * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          <div className={styles.divider}></div>
          <div className={styles.totalRow}>
            <span>Grand Total Paid</span>
            <span className={styles.totalValue}>${order.totalAmount.toFixed(2)}</span>
          </div>
        </div>

        {/* Shipping & Delivery Progress */}
        <div className={styles.metaColumn}>
          {/* Shipping details */}
          <div className={`${styles.metaCard} glass-panel`}>
            <div className={styles.cardHeader}>
              <MapPin size={20} className={styles.headerIcon} />
              <h3>Shipping Information</h3>
            </div>
            <div className={styles.divider}></div>
            <p className={styles.address}>{order.shippingAddress}</p>
          </div>

          {/* Logistics status info */}
          <div className={`${styles.metaCard} glass-panel`}>
            <div className={styles.cardHeader}>
              <Clock size={20} className={styles.headerIcon} />
              <h3>Order Status</h3>
            </div>
            <div className={styles.divider}></div>
            <div className={styles.statusRow}>
              <Calendar size={16} />
              <span>Placed On: {new Date(order.createdAt).toLocaleDateString()}</span>
            </div>
            <div className={styles.statusRow} style={{ marginTop: '10px' }}>
              <span className={`badge ${
                order.status === 'Delivered' ? 'badge-success' :
                order.status === 'Cancelled' ? 'badge-error' : 'badge-primary'
              }`}>
                Current Status: {order.status}
              </span>
            </div>
          </div>

          {/* Quick links */}
          <div className={styles.metaActions}>
            <Link href="/products" className="btn-primary w-full" style={{ justifyContent: 'center' }}>
              <ShoppingBag size={18} />
              Continue Shopping
            </Link>
            <Link href="/profile" className="btn-secondary w-full" style={{ justifyContent: 'center' }}>
              View Order History
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
