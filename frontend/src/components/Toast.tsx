'use client';

import React, { useEffect, useState } from 'react';
import { useToast, Toast as ToastType } from '../context/ToastContext';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import styles from './Toast.module.css';

const iconMap = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
};

const ToastItem: React.FC<{ toast: ToastType; onRemove: (id: string) => void }> = ({ toast, onRemove }) => {
  const [exiting, setExiting] = useState(false);
  const Icon = iconMap[toast.type];

  useEffect(() => {
    const exitTimer = setTimeout(() => {
      setExiting(true);
    }, toast.duration - 400);

    return () => clearTimeout(exitTimer);
  }, [toast.duration]);

  const handleClose = () => {
    setExiting(true);
    setTimeout(() => onRemove(toast.id), 300);
  };

  return (
    <div className={`${styles.toast} ${styles[toast.type]} ${exiting ? styles.exit : styles.enter}`}>
      <div className={styles.iconWrap}>
        <Icon size={18} />
      </div>
      <span className={styles.message}>{toast.message}</span>
      <button onClick={handleClose} className={styles.closeBtn} aria-label="Dismiss">
        <X size={14} />
      </button>
      <div className={styles.progressBar}>
        <div
          className={styles.progressFill}
          style={{ animationDuration: `${toast.duration}ms` }}
        />
      </div>
    </div>
  );
};

const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className={styles.container}>
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  );
};

export default ToastContainer;
