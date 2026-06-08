'use client';

import { useEffect, useRef } from 'react';
import { Product } from '@/interface/product';
import { trackViewItem, trackViewItemList } from '@/lib/analytics';

type ViewItemProps = {
  event: 'view_item';
  product: Product;
};

type ViewItemListProps = {
  event: 'view_item_list';
  products: Product[];
  listName: string;
  listId?: string;
};

type EcommerceTrackerProps = ViewItemProps | ViewItemListProps;

export default function EcommerceTracker(props: EcommerceTrackerProps) {
  const trackedRef = useRef(false);

  useEffect(() => {
    if (trackedRef.current) return;
    trackedRef.current = true;

    if (props.event === 'view_item') {
      trackViewItem(props.product);
      return;
    }

    if (props.products.length > 0) {
      trackViewItemList(props.products, props.listName, props.listId);
    }
  }, [props]);

  return null;
}
