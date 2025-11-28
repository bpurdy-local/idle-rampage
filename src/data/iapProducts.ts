export type IAPProductType = 'builders' | 'boost' | 'cosmetic';

export interface IAPProduct {
  id: string;
  name: string;
  description: string;
  type: IAPProductType;
  price: string;
  buildersGranted?: number;
  boostDuration?: number;
  boostMultiplier?: number;
  permanentBonus?: number;
  iosProductId: string;
  androidProductId: string;
}

export const IAP_PRODUCTS: IAPProduct[] = [
  {
    id: 'builder_pack_small',
    name: 'Builder Pack',
    description: '+10 Builders',
    type: 'builders',
    price: '$0.99',
    buildersGranted: 10,
    iosProductId: 'com.idlerampage.builders.small',
    androidProductId: 'builders_pack_small',
  },
  {
    id: 'builder_pack_medium',
    name: 'Builder Bundle',
    description: '+20 Builders + 5% Production Bonus',
    type: 'builders',
    price: '$2.99',
    buildersGranted: 20,
    permanentBonus: 0.05,
    iosProductId: 'com.idlerampage.builders.medium',
    androidProductId: 'builders_pack_medium',
  },
  {
    id: 'builder_pack_large',
    name: 'Builder Premium Pack',
    description: '+50 Builders + 10% Production Bonus',
    type: 'builders',
    price: '$4.99',
    buildersGranted: 50,
    permanentBonus: 0.1,
    iosProductId: 'com.idlerampage.builders.large',
    androidProductId: 'builders_pack_large',
  },
  {
    id: 'boost_production_1h',
    name: 'Production Boost (1 Hour)',
    description: '2x Production for 1 hour',
    type: 'boost',
    price: '$0.99',
    boostDuration: 3600,
    boostMultiplier: 2,
    iosProductId: 'com.idlerampage.boost.production.1h',
    androidProductId: 'boost_production_1h',
  },
  {
    id: 'boost_combat_1h',
    name: 'Combat Boost (1 Hour)',
    description: '2x Combat Damage for 1 hour',
    type: 'boost',
    price: '$0.99',
    boostDuration: 3600,
    boostMultiplier: 2,
    iosProductId: 'com.idlerampage.boost.combat.1h',
    androidProductId: 'boost_combat_1h',
  },
  {
    id: 'boost_all_4h',
    name: 'Super Boost (4 Hours)',
    description: '2x Everything for 4 hours',
    type: 'boost',
    price: '$2.99',
    boostDuration: 14400,
    boostMultiplier: 2,
    iosProductId: 'com.idlerampage.boost.all.4h',
    androidProductId: 'boost_all_4h',
  },
];

export const getIAPProductById = (id: string): IAPProduct | undefined => {
  return IAP_PRODUCTS.find(p => p.id === id);
};

export const getBuilderPacks = (): IAPProduct[] => {
  return IAP_PRODUCTS.filter(p => p.type === 'builders');
};

export const getBoostProducts = (): IAPProduct[] => {
  return IAP_PRODUCTS.filter(p => p.type === 'boost');
};
