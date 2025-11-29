import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import {IAP_PRODUCTS, IAPProduct} from '../../data/iapProducts';

interface ScavengersDepotProps {
  onClose: () => void;
  onPurchase: (productId: string) => void;
  currentBuilders: number;
  maxBuilders: number;
}

type TabType = 'builders' | 'boosts' | 'about';

export const ScavengersDepot: React.FC<ScavengersDepotProps> = ({
  onClose,
  onPurchase,
  currentBuilders,
  maxBuilders,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('builders');

  const builderPacks = IAP_PRODUCTS.filter(p => p.type === 'builders');
  const boostProducts = IAP_PRODUCTS.filter(p => p.type === 'boost');

  const handlePurchase = (product: IAPProduct) => {
    // Check if builder pack would exceed max
    if (product.type === 'builders' && product.buildersGranted) {
      const newTotal = currentBuilders + product.buildersGranted;
      if (newTotal > maxBuilders) {
        Alert.alert(
          'Builder Limit',
          `You can only have ${maxBuilders} builders maximum. You currently have ${currentBuilders}.`,
          [{text: 'OK'}],
        );
        return;
      }
    }

    // Confirm purchase
    Alert.alert(
      'Confirm Purchase',
      `Purchase ${product.name} for ${product.price}?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Purchase',
          onPress: () => onPurchase(product.id),
        },
      ],
    );
  };

  const renderProductCard = (product: IAPProduct) => {
    const isBuilderPack = product.type === 'builders';
    const accentColor = isBuilderPack ? '#FFD700' : '#00CED1';

    return (
      <TouchableOpacity
        key={product.id}
        style={[styles.productCard, {borderColor: accentColor}]}
        onPress={() => handlePurchase(product)}
        activeOpacity={0.7}>
        <View style={styles.productHeader}>
          <Text style={[styles.productName, {color: accentColor}]}>
            {product.name}
          </Text>
          <View style={[styles.priceBadge, {backgroundColor: accentColor}]}>
            <Text style={styles.priceText}>{product.price}</Text>
          </View>
        </View>

        <Text style={styles.productDescription}>{product.description}</Text>

        {isBuilderPack && product.permanentBonus && (
          <View style={styles.bonusTag}>
            <Text style={styles.bonusText}>
              +{Math.round(product.permanentBonus * 100)}% Permanent Production Bonus
            </Text>
          </View>
        )}

        {product.type === 'boost' && product.boostDuration && (
          <View style={styles.durationTag}>
            <Text style={styles.durationText}>
              Duration: {product.boostDuration >= 3600
                ? `${product.boostDuration / 3600} hour${product.boostDuration > 3600 ? 's' : ''}`
                : `${product.boostDuration / 60} minutes`}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Scavenger's Depot</Text>
          <Text style={styles.subtitle}>Trade with the wasteland merchants</Text>
        </View>
        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
          <Text style={styles.closeBtnText}>×</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'builders' && styles.activeTab]}
          onPress={() => setActiveTab('builders')}>
          <Text style={[styles.tabText, activeTab === 'builders' && styles.activeTabText]}>
            Builders
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'boosts' && styles.activeTab]}
          onPress={() => setActiveTab('boosts')}>
          <Text style={[styles.tabText, activeTab === 'boosts' && styles.activeTabText]}>
            Boosts
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'about' && styles.activeTab]}
          onPress={() => setActiveTab('about')}>
          <Text style={[styles.tabText, activeTab === 'about' && styles.activeTabText]}>
            About
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'builders' && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recruit Survivors</Text>
              <Text style={styles.builderCount}>
                {currentBuilders}/{maxBuilders} Builders
              </Text>
            </View>
            <Text style={styles.sectionSubtitle}>
              Wandering survivors seek refuge. Recruit them to expand your workforce.
            </Text>

            {builderPacks.map(renderProductCard)}

            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>About Builders</Text>
              <Text style={styles.infoText}>
                Builders are survivors who join your settlement. Assign them to buildings
                to increase production, damage, and other effects. More builders = faster progress!
              </Text>
            </View>
          </View>
        )}

        {activeTab === 'boosts' && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Scavenged Tech</Text>
            </View>
            <Text style={styles.sectionSubtitle}>
              Rare pre-war technology that temporarily supercharges your operations.
            </Text>

            {boostProducts.map(renderProductCard)}

            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>About Boosts</Text>
              <Text style={styles.infoText}>
                Boosts are temporary power-ups that multiply your production or combat damage.
                Use them strategically for maximum impact - especially during boss waves!
              </Text>
            </View>
          </View>
        )}

        {activeTab === 'about' && (
          <View style={styles.section}>
            <View style={styles.aboutCard}>
              <Text style={styles.aboutTitle}>The Scavenger's Depot</Text>
              <Text style={styles.aboutText}>
                In the chaos following the Great AI Collapse, a network of traders emerged.
                They call themselves the Scavengers - nomads who brave the machine-infested
                wasteland to salvage pre-war technology and rescue stranded survivors.
              </Text>
              <Text style={styles.aboutText}>
                The Depot is their trading post, a neutral ground where settlements like yours
                can acquire rare resources. The Scavengers accept only one currency: the
                pre-war digital credits that somehow survived the Collapse.
              </Text>
              <Text style={styles.aboutText}>
                Some say the Scavengers know secrets about the machines - that they've learned
                to move undetected through hostile territory. Others whisper that they're
                searching for something... the source of the AI that destroyed civilization.
              </Text>
            </View>

            <View style={styles.supportCard}>
              <Text style={styles.supportTitle}>Support Development</Text>
              <Text style={styles.supportText}>
                Purchases help support ongoing development of Idle Rampage. Thank you for
                playing and helping us build a better game!
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerContent: {
    flex: 1,
  },
  title: {
    color: '#FFD700',
    fontSize: 24,
    fontWeight: '700',
  },
  subtitle: {
    color: '#888',
    fontSize: 13,
    marginTop: 4,
    fontStyle: 'italic',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    color: '#fff',
    fontSize: 28,
    lineHeight: 32,
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#FFD700',
  },
  tabText: {
    color: '#666',
    fontSize: 15,
    fontWeight: '600',
  },
  activeTabText: {
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  builderCount: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: '600',
  },
  sectionSubtitle: {
    color: '#888',
    fontSize: 13,
    marginBottom: 16,
    fontStyle: 'italic',
  },
  productCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  productName: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  priceBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  priceText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '700',
  },
  productDescription: {
    color: '#ccc',
    fontSize: 14,
    lineHeight: 20,
  },
  bonusTag: {
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  bonusText: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: '600',
  },
  durationTag: {
    backgroundColor: 'rgba(0, 206, 209, 0.15)',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  durationText: {
    color: '#00CED1',
    fontSize: 12,
    fontWeight: '600',
  },
  infoBox: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#444',
  },
  infoTitle: {
    color: '#888',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  infoText: {
    color: '#666',
    fontSize: 13,
    lineHeight: 20,
  },
  aboutCard: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#FFD700',
  },
  aboutTitle: {
    color: '#FFD700',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  aboutText: {
    color: '#ccc',
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 12,
  },
  supportCard: {
    backgroundColor: '#1a2a1a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  supportTitle: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  supportText: {
    color: '#aaa',
    fontSize: 13,
    lineHeight: 20,
  },
});
