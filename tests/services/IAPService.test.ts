import {IAPService, IAPEvents} from '../../src/services/IAPService';
import {IAP_PRODUCTS} from '../../src/data/iapProducts';
import {eventBus} from '../../src/core/EventBus';

// Mock react-native-iap
jest.mock('react-native-iap', () => ({
  initConnection: jest.fn(),
  endConnection: jest.fn(),
  getProducts: jest.fn(),
  requestPurchase: jest.fn(),
  finishTransaction: jest.fn(),
  purchaseUpdatedListener: jest.fn(() => ({remove: jest.fn()})),
  purchaseErrorListener: jest.fn(() => ({remove: jest.fn()})),
  getAvailablePurchases: jest.fn(),
  ErrorCode: {
    E_USER_CANCELLED: 'E_USER_CANCELLED',
  },
}));

// Mock react-native Platform
jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
    select: jest.fn(),
  },
}));

import * as RNIap from 'react-native-iap';

const mockedRNIap = RNIap as jest.Mocked<typeof RNIap>;

describe('IAPService', () => {
  let service: IAPService;
  let eventSpy: jest.SpyInstance;

  beforeEach(() => {
    service = new IAPService();
    jest.clearAllMocks();
    eventSpy = jest.spyOn(eventBus, 'emit');
  });

  afterEach(async () => {
    await service.cleanup();
    eventSpy.mockRestore();
  });

  describe('initialize', () => {
    it('initializes IAP connection', async () => {
      mockedRNIap.initConnection.mockResolvedValue(true as any);

      const result = await service.initialize();

      expect(result).toBe(true);
      expect(mockedRNIap.initConnection).toHaveBeenCalled();
    });

    it('returns true if already initialized', async () => {
      mockedRNIap.initConnection.mockResolvedValue(true as any);

      await service.initialize();
      const result = await service.initialize();

      expect(result).toBe(true);
      expect(mockedRNIap.initConnection).toHaveBeenCalledTimes(1);
    });

    it('returns false on initialization error', async () => {
      mockedRNIap.initConnection.mockRejectedValue(new Error('Network error'));

      const result = await service.initialize();

      expect(result).toBe(false);
    });
  });

  describe('cleanup', () => {
    it('ends connection when initialized', async () => {
      mockedRNIap.initConnection.mockResolvedValue(true as any);
      mockedRNIap.endConnection.mockResolvedValue(true as any);

      await service.initialize();
      await service.cleanup();

      expect(mockedRNIap.endConnection).toHaveBeenCalled();
    });

    it('does nothing when not initialized', async () => {
      await service.cleanup();

      expect(mockedRNIap.endConnection).not.toHaveBeenCalled();
    });
  });

  describe('loadProducts', () => {
    it('loads products from store', async () => {
      mockedRNIap.initConnection.mockResolvedValue(true as any);
      mockedRNIap.getProducts.mockResolvedValue([
        {
          productId: 'builder_pack_small',
          localizedPrice: '$0.99',
          price: '0.99',
          currency: 'USD',
        },
      ] as any);

      const products = await service.loadProducts();

      expect(products.length).toBeGreaterThan(0);
      expect(mockedRNIap.getProducts).toHaveBeenCalled();
      expect(eventSpy).toHaveBeenCalledWith(
        IAPEvents.PRODUCTS_LOADED,
        expect.any(Object),
      );
    });

    it('returns base products on error', async () => {
      mockedRNIap.initConnection.mockResolvedValue(true as any);
      mockedRNIap.getProducts.mockRejectedValue(new Error('Store unavailable'));

      const products = await service.loadProducts();

      expect(products.length).toBe(IAP_PRODUCTS.length);
    });
  });

  describe('purchase', () => {
    it('fails when not initialized', async () => {
      const result = await service.purchase('builder_pack_small');

      expect(result.success).toBe(false);
      expect(result.error).toBe('IAP not initialized');
    });

    it('fails for unknown product', async () => {
      mockedRNIap.initConnection.mockResolvedValue(true as any);
      await service.initialize();

      const result = await service.purchase('unknown_product');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Product not found');
    });

    it('initiates purchase for valid product', async () => {
      mockedRNIap.initConnection.mockResolvedValue(true as any);
      mockedRNIap.requestPurchase.mockResolvedValue({} as any);
      await service.initialize();

      const result = await service.purchase('builder_pack_small');

      expect(result.success).toBe(true);
      expect(result.productId).toBe('builder_pack_small');
      // iOS uses {sku: productId} format
      expect(mockedRNIap.requestPurchase).toHaveBeenCalledWith({
        sku: 'builder_pack_small',
      });
    });

    it('returns error on purchase failure', async () => {
      mockedRNIap.initConnection.mockResolvedValue(true as any);
      mockedRNIap.requestPurchase.mockRejectedValue(new Error('Payment declined'));
      await service.initialize();

      const result = await service.purchase('builder_pack_small');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Payment declined');
    });
  });

  describe('restorePurchases', () => {
    it('fails when not initialized', async () => {
      const result = await service.restorePurchases();

      expect(result.success).toBe(false);
      expect(result.error).toBe('IAP not initialized');
    });

    it('restores available purchases', async () => {
      mockedRNIap.initConnection.mockResolvedValue(true as any);
      mockedRNIap.getAvailablePurchases.mockResolvedValue([
        {productId: 'builder_pack_small'},
        {productId: 'builder_pack_medium'},
      ] as any);
      await service.initialize();

      const result = await service.restorePurchases();

      expect(result.success).toBe(true);
      expect(result.purchases).toContain('builder_pack_small');
      expect(result.purchases).toContain('builder_pack_medium');
      expect(eventSpy).toHaveBeenCalledWith(
        IAPEvents.RESTORE_SUCCESS,
        expect.any(Object),
      );
    });

    it('handles restore error', async () => {
      mockedRNIap.initConnection.mockResolvedValue(true as any);
      mockedRNIap.getAvailablePurchases.mockRejectedValue(new Error('Not signed in'));
      await service.initialize();

      const result = await service.restorePurchases();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Not signed in');
      expect(eventSpy).toHaveBeenCalledWith(
        IAPEvents.RESTORE_ERROR,
        expect.any(Object),
      );
    });
  });

  describe('getProduct', () => {
    it('returns undefined for unknown product', () => {
      const product = service.getProduct('unknown');
      expect(product).toBeUndefined();
    });

    it('returns product info for known product', () => {
      const product = service.getProduct('builder_pack_small');
      expect(product).toBeDefined();
      expect(product?.id).toBe('builder_pack_small');
    });
  });

  describe('getBuilderPacks', () => {
    it('returns only builder products', () => {
      const packs = service.getBuilderPacks();

      expect(packs.length).toBeGreaterThan(0);
      for (const pack of packs) {
        expect(pack.type).toBe('builders');
      }
    });
  });

  describe('getBoosts', () => {
    it('returns only boost products', () => {
      const boosts = service.getBoosts();

      expect(boosts.length).toBeGreaterThan(0);
      for (const boost of boosts) {
        expect(boost.type).toBe('boost');
      }
    });
  });

  describe('isAvailable', () => {
    it('returns false when not initialized', () => {
      expect(service.isAvailable()).toBe(false);
    });

    it('returns true when initialized', async () => {
      mockedRNIap.initConnection.mockResolvedValue(true as any);
      await service.initialize();

      expect(service.isAvailable()).toBe(true);
    });
  });

  describe('setOnPurchaseComplete', () => {
    it('sets callback for purchase completion', () => {
      const callback = jest.fn();
      service.setOnPurchaseComplete(callback);

      // Just verify it doesn't throw
      expect(() => service.setOnPurchaseComplete(callback)).not.toThrow();
    });
  });
});
