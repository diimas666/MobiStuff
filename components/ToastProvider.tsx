'use client';

import dynamic from 'next/dynamic';

const ToastContainer = dynamic(
  () => import('react-toastify').then((mod) => mod.ToastContainer),
  { ssr: false }
);

import 'react-toastify/dist/ReactToastify.css';

export default function ToastProvider() {
  return <ToastContainer position="top-right" autoClose={3000} />;
}
