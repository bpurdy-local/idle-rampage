import {Platform} from 'react-native';
import {
  initConnection,
  endConnection,
  getProducts,
  requestPurchase,
  finishTransaction,
  purchaseUpdatedListener,
  purchaseErrorListener,
  getAvailablePurchases,
  type Purchase,
  type PurchaseError,
  ErrorCode,
} from 'react-native-iap';
import {IAP_PRODUCTS, IAPProduct} from '../data/iapProducts';
import {eventBus} from '../core/EventBus';

// Custom events for IAP
export const IAPEvents = {
  PURCHASE_SUCCESS: 'iap_purchase_success',
  PURCHASE_ERROR: 'iap_purchase_error',
  PURCHASE_CANCELLED: 'iap_purchase_cancelled',
  PRODUCTS_LOADED: 'iap_products_loaded',
  RESTORE_SUCCESS: 'iap_restore_success',
  RESTORE_ERROR: 'iap_restore_error',
} as const;

export interface IAPProductWithPrice extends Omit<IAPProduct, 'price'> {
  price: string;
  localizedPrice?: string;
  priceValue?: number;
  currency?: string;
}

export interface PurchaseResult {
  success: boolean;
  productId?: string;
  error?: string;
  transactionId?: string;
}

interface StoreProduct {
  productId: string;
  localizedPrice?: string;
  price?: string;
  currency?: string;
}

export class IAPService {
  private isInitialized = false;
  private products: Map<string, StoreProduct> = new Map();
  private purchaseUpdateSubscription: ReturnType<typeof purchaseUpdatedListener> | null = null;
  private purchaseErrorSubscription: ReturnType<typeof purchaseErrorListener> | null = null;
  private onPurchaseComplete?: (productId: string, transactionId: string) => void;

  /**
   * Initialize IAP connection
   */
  async initialize(): Promise<boolean> {
    if (this.isInitialized) {
      return true;
    }

    try {
      await initConnection();
      this.setupListeners();
      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize IAP:', error);
      return false;
    }
  }

  /**
   * Clean up IAP connection
   */
  async cleanup(): Promise<void> {
    this.purchaseUpdateSubscription?.remove();
    this.purchaseErrorSubscription?.remove();
    this.purchaseUpdateSubscription = null;
    this.purchaseErrorSubscription = null;

    if (this.isInitialized) {
      await endConnection();
      this.isInitialized = false;
    }
  }

  /**
   * Set up purchase listeners
   */
  private setupListeners(): void {
    this.purchaseUpdateSubscription = purchaseUpdatedListener(
      async (purchase: Purchase) => {
        const transactionId = purchase.transactionId;

        if (transactionId) {
          try {
            await finishTransaction({purchase, isConsumable: this.isConsumable(purchase.productId)});

            eventBus.emit(IAPEvents.PURCHASE_SUCCESS, {
              productId: purchase.productId,
              transactionId: purchase.transactionId,
            });

            this.onPurchaseComplete?.(
              purchase.productId,
              purchase.transactionId ?? '',
            );
          } catch (error) {
            console.error('Failed to finish transaction:', error);
          }
        }
      },
    );

    this.purchaseErrorSubscription = purchaseErrorListener(
      (error: PurchaseError) => {
        const isCancelled = error.code === ErrorCode.E_USER_CANCELLED ||
                           error.message?.includes('cancelled') ||
                           error.message?.includes('canceled');

        if (isCancelled) {
          eventBus.emit(IAPEvents.PURCHASE_CANCELLED, {
            productId: error.productId,
          });
        } else {
          eventBus.emit(IAPEvents.PURCHASE_ERROR, {
            productId: error.productId,
            error: error.message,
          });
        }
      },
    );
  }

  /**
   * Check if product is consumable (boosts are consumable)
   */
  private isConsumable(productId: string): boolean {
    const product = IAP_PRODUCTS.find(p => p.id === productId);
    return product?.type === 'boost';
  }

  /**
   * Load products from store
   */
  async loadProducts(): Promise<IAPProductWithPrice[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      const productIds = IAP_PRODUCTS.map(p => p.id);
      const storeProducts = await getProducts({skus: productIds});

      this.products.clear();
      if (storeProducts) {
        for (const product of storeProducts) {
          this.products.set(product.productId, {
            productId: product.productId,
            localizedPrice: product.localizedPrice,
            price: product.price?.toString(),
            currency: product.currency,
          });
        }
      }

      const enrichedProducts = IAP_PRODUCTS.map(iapProduct => {
        const storeProduct = this.products.get(iapProduct.id);
        return {
          ...iapProduct,
          localizedPrice: storeProduct?.localizedPrice,
          priceValue: storeProduct?.price ? parseFloat(storeProduct.price) : undefined,
          currency: storeProduct?.currency,
        };
      });

      eventBus.emit(IAPEvents.PRODUCTS_LOADED, {products: enrichedProducts});

      return enrichedProducts;
    } catch (error) {
      console.error('Failed to load products:', error);
      return IAP_PRODUCTS.map(p => ({...p}));
    }
  }

  /**
   * Purchase a product
   */
  async purchase(productId: string): Promise<PurchaseResult> {
    if (!this.isInitialized) {
      return {
        success: false,
        error: 'IAP not initialized',
      };
    }

    const iapProduct = IAP_PRODUCTS.find(p => p.id === productId);
    if (!iapProduct) {
      return {
        success: false,
        error: 'Product not found',
      };
    }

    try {
      // Use platform-specific request format for react-native-iap v14+
      if (Platform.OS === 'ios') {
        await requestPurchase({sku: productId});
      } else {
        await requestPurchase({skus: [productId]});
      }

      // The actual result comes through the listener
      return {
        success: true,
        productId,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Purchase failed';
      return {
        success: false,
        productId,
        error: errorMessage,
      };
    }
  }

  /**
   * Restore previous purchases (for non-consumables)
   */
  async restorePurchases(): Promise<{success: boolean; purchases: string[]; error?: string}> {
    if (!this.isInitialized) {
      return {
        success: false,
        purchases: [],
        error: 'IAP not initialized',
      };
    }

    try {
      const purchases = await getAvailablePurchases();
      const productIds = purchases?.map(p => p.productId) ?? [];

      eventBus.emit(IAPEvents.RESTORE_SUCCESS, {productIds});

      return {
        success: true,
        purchases: productIds,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Restore failed';
      eventBus.emit(IAPEvents.RESTORE_ERROR, {error: errorMessage});

      return {
        success: false,
        purchases: [],
        error: errorMessage,
      };
    }
  }

  /**
   * Set callback for completed purchases
   */
  setOnPurchaseComplete(callback: (productId: string, transactionId: string) => void): void {
    this.onPurchaseComplete = callback;
  }

  /**
   * Get product info by ID
   */
  getProduct(productId: string): IAPProductWithPrice | undefined {
    const iapProduct = IAP_PRODUCTS.find(p => p.id === productId);
    if (!iapProduct) return undefined;

    const storeProduct = this.products.get(productId);
    return {
      ...iapProduct,
      localizedPrice: storeProduct?.localizedPrice,
      priceValue: storeProduct?.price ? parseFloat(storeProduct.price) : undefined,
      currency: storeProduct?.currency,
    };
  }

  /**
   * Get all builder pack products
   */
  getBuilderPacks(): IAPProductWithPrice[] {
    return IAP_PRODUCTS.filter(p => p.type === 'builders').map(p => ({
      ...p,
      ...this.getProduct(p.id),
    }));
  }

  /**
   * Get all boost products
   */
  getBoosts(): IAPProductWithPrice[] {
    return IAP_PRODUCTS.filter(p => p.type === 'boost').map(p => ({
      ...p,
      ...this.getProduct(p.id),
    }));
  }

  /**
   * Check if IAP is available on device
   */
  isAvailable(): boolean {
    return this.isInitialized;
  }
}

// Singleton instance
export const iapService = new IAPService();
