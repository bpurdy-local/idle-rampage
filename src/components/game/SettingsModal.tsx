import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import {EVOLVABLE_BUILDINGS} from '../../data/buildings';
import {BuildingState} from '../../core/GameState';

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
  buildings: BuildingState[];
}

type TabType = 'help' | 'story';

interface StoryEntry {
  buildingId: string;
  tier: number;
  title: string;
  story: string;
}

const STORY_ENTRIES: StoryEntry[] = [
  // Scrap Works storyline
  {
    buildingId: 'scrap_works',
    tier: 1,
    title: 'Chapter 1: The Awakening',
    story: 'You awaken in a world overrun by rogue machines. The Great AI Collapse left civilization in ruins, with autonomous robots now wandering the wasteland. Your only hope? Salvage what remains and build a resistance.\n\nYou establish your first Scrap Collector - a humble station where workers gather metal and components from the debris. It\'s not much, but it\'s a start.',
  },
  {
    buildingId: 'scrap_works',
    tier: 2,
    title: 'Recycler Online',
    story: 'Your operation grows more sophisticated. The Recycler processes raw scrap into refined materials, recovering valuable alloys that would otherwise be lost. Your workers have learned to extract more from less - a crucial skill in this resource-scarce world.',
  },
  {
    buildingId: 'salvage_yard',
    tier: 1,
    title: 'The Scavengers Arrive',
    story: 'Word of your settlement spreads across the wasteland. One morning, a caravan of armored vehicles arrives at your gates - the Scavengers.\n\nThey\'re nomadic traders who brave machine-infested territories, salvaging pre-war technology and rescuing stranded survivors. Their leader offers a deal: they\'ll establish a trading post here, a "Scavenger\'s Depot," in exchange for protection.\n\nThe Depot becomes your lifeline to the wider world, offering rare resources and recruiting survivors to join your cause. Visit the golden "Depot" tab to see what they have for trade.',
  },
  {
    buildingId: 'scrap_works',
    tier: 3,
    title: 'The Refinery',
    story: 'With enough refined materials, you construct a proper Refinery. The automated furnaces burn day and night, transforming raw scrap into high-grade components. Other survivors begin to take notice of your growing operation.',
  },
  {
    buildingId: 'scrap_works',
    tier: 4,
    title: 'Industrial Revival',
    story: 'The Factory represents humanity\'s resurgence. Assembly lines hum with purpose as your workers mass-produce components with pre-war efficiency. The machines thought they had won - they were wrong.',
  },
  {
    buildingId: 'scrap_works',
    tier: 5,
    title: 'The Megaplex',
    story: 'A testament to human determination rises from the ashes. The Megaplex is the largest production facility since the Collapse - a beacon of hope visible for miles. Inside, automated systems and human ingenuity work in harmony, producing more resources than ever thought possible.',
  },

  // Turret Station storyline
  {
    buildingId: 'turret_station',
    tier: 1,
    title: 'First Defense',
    story: 'The robots have found you. Waves of hostile machines probe your defenses, testing for weakness. You hastily construct a Turret Bay - crude automated guns that provide continuous fire against the mechanical horde. Sleep becomes possible again.',
  },
  {
    buildingId: 'turret_station',
    tier: 2,
    title: 'Gun Emplacement',
    story: 'Salvaged targeting systems upgrade your defenses. The Gun Emplacement tracks multiple targets simultaneously, its rapid-fire cannons shredding through lighter units. The machines adapt, sending stronger units - but so do you.',
  },
  {
    buildingId: 'turret_station',
    tier: 3,
    title: 'Weapons Lab',
    story: 'Captured robot technology reveals secrets of their construction. Your engineers weaponize this knowledge, developing experimental armaments that exploit machine vulnerabilities. The hunters become the hunted.',
  },
  {
    buildingId: 'turret_station',
    tier: 4,
    title: 'War Factory',
    story: 'The War Factory churns out military-grade weaponry around the clock. Heavy artillery, missile systems, electromagnetic pulse generators - humanity\'s arsenal grows formidable. The robot incursions become less frequent; they\'re learning to fear you.',
  },
  {
    buildingId: 'turret_station',
    tier: 5,
    title: 'Doom Fortress',
    story: 'The ultimate in automated destruction. The Doom Fortress bristles with weapons of terrifying power - orbital strike beacons, plasma cannons, nanite swarms. No machine survives long in its shadow. The tide of war has turned.',
  },

  // Training Facility storyline
  {
    buildingId: 'training_facility',
    tier: 1,
    title: 'Learning to Fight',
    story: 'Automated turrets help, but human resilience remains your greatest weapon. The Training Ground teaches survivors to fight - how to strike machine weak points, where to aim for maximum damage. Every tap becomes more lethal.',
  },
  {
    buildingId: 'training_facility',
    tier: 2,
    title: 'Combat Academy',
    story: 'Veterans share hard-won knowledge at the Combat Academy. Combat techniques passed down through generations of resistance fighters transform raw recruits into effective warriors. Morale soars as victories mount.',
  },
  {
    buildingId: 'training_facility',
    tier: 3,
    title: 'Elite Barracks',
    story: 'Only the best train here. The Elite Barracks produces warriors of legendary skill - soldiers who can disable a war-bot with a single well-placed strike. Their reputation spreads across the wasteland.',
  },
  {
    buildingId: 'training_facility',
    tier: 4,
    title: 'War College',
    story: 'Strategy meets strength at the War College. Tactical geniuses study machine behavior, developing combat doctrines that maximize human advantages. Your forces fight smarter, not just harder.',
  },
  {
    buildingId: 'training_facility',
    tier: 5,
    title: 'Champion Arena',
    story: 'The greatest warriors in the wasteland prove themselves in the Champion Arena. Combat tournaments forge unbreakable spirits and perfect technique. Champions trained here possess almost supernatural combat prowess.',
  },

  // Salvage Yard storyline
  {
    buildingId: 'salvage_yard',
    tier: 1,
    title: 'Waste Not',
    story: 'Every fallen machine is an opportunity. The Salvage Yard systematically strips defeated robots of valuable components. What once threatened you now fuels your growth. Waste not, want not.',
  },
  {
    buildingId: 'salvage_yard',
    tier: 2,
    title: 'Reclamation Center',
    story: 'Specialist teams now work the battlefield. The Reclamation Center coordinates salvage operations, ensuring no valuable component goes unrecovered. Even the smallest scrap finds purpose.',
  },
  {
    buildingId: 'salvage_yard',
    tier: 3,
    title: 'Loot Processor',
    story: 'Advanced machinery analyzes captured technology. The Loot Processor extracts maximum value from robot remains, revealing hidden caches of rare materials the machines themselves didn\'t know they carried.',
  },
  {
    buildingId: 'salvage_yard',
    tier: 4,
    title: 'Trophy Hall',
    story: 'A monument to victory, the Trophy Hall displays the most impressive machine kills. But it\'s more than memorial - specialized equipment extracts unique components from elite units, yielding rewards beyond measure.',
  },
  {
    buildingId: 'salvage_yard',
    tier: 5,
    title: 'Spoils Vault',
    story: 'Deep within fortified walls, the Spoils Vault stores humanity\'s accumulated machine-harvested wealth. Automated sorting systems process the constant influx of spoils, ensuring nothing of value escapes notice.',
  },

  // Engineering Bay storyline
  {
    buildingId: 'engineering_bay',
    tier: 1,
    title: 'Clever Solutions',
    story: 'Resources are scarce; ingenuity is not. The Engineering Bay develops clever solutions to reduce upgrade costs. Salvaged schematics and reverse-engineered designs stretch every scrap further.',
  },
  {
    buildingId: 'engineering_bay',
    tier: 2,
    title: 'Research Lab',
    story: 'Captured machine cores yield their secrets in the Research Lab. Scientists decode alien algorithms, discovering more efficient construction methods. Every breakthrough makes the next upgrade cheaper.',
  },
  {
    buildingId: 'engineering_bay',
    tier: 3,
    title: 'Innovation Hub',
    story: 'Creativity flourishes at the Innovation Hub. Engineers compete to find better designs, lighter materials, more elegant solutions. The spirit of pre-war innovation reawakens.',
  },
  {
    buildingId: 'engineering_bay',
    tier: 4,
    title: 'Tech Nexus',
    story: 'Human knowledge merges with machine precision at the Tech Nexus. Advanced simulations test designs before construction, eliminating waste and optimizing every component. Efficiency reaches new heights.',
  },
  {
    buildingId: 'engineering_bay',
    tier: 5,
    title: 'Singularity Core',
    story: 'The pinnacle of human-machine cooperation. The Singularity Core processes data at incomprehensible speeds, designing perfect solutions to any engineering challenge. Technology that once threatened humanity now serves it.',
  },

  // Command Center storyline
  {
    buildingId: 'command_center',
    tier: 1,
    title: 'Establishing Order',
    story: 'Scattered survivors unite under the Outpost\'s banner. For the first time since the Collapse, there\'s coordination - resources flow efficiently, workers are directed where needed most. Leadership emerges from chaos.',
  },
  {
    buildingId: 'command_center',
    tier: 2,
    title: 'Command Center',
    story: 'A proper Command Center rises, complete with communication arrays and strategic displays. From here, the resistance coordinates across the wasteland. Multiple settlements link together, sharing resources and intelligence.',
  },
  {
    buildingId: 'command_center',
    tier: 3,
    title: 'The War Room',
    story: 'Holographic displays chart machine movements across continents. The War Room coordinates global resistance efforts - when one settlement falls, others reinforce. Humanity fights as one for the first time since the Collapse.',
  },
  {
    buildingId: 'command_center',
    tier: 4,
    title: 'The Citadel',
    story: 'A monument to humanity\'s resurgence. The Citadel commands respect from ally and enemy alike - a fortress of strategy and strength from which the final war will be directed. Victory is no longer a dream; it\'s an inevitability.',
  },
];

const HELP_SECTIONS = [
  {
    title: 'Welcome to Idle Rampage',
    content: 'You\'re humanity\'s last hope against rogue machines! Build your base, assign workers, and fight back against endless waves of hostile robots.',
  },
  {
    title: 'Resources',
    content: 'Scrap - Your main currency. Use it to upgrade buildings and hire builders.\n\nBlueprints - Earned from Prestige. Spend them on permanent upgrades.\n\nBuilders - Workers you assign to buildings. More builders = more production!',
  },
  {
    title: 'Buildings',
    content: 'Production Buildings generate scrap over time.\n\nCombat Buildings deal damage to enemies automatically or boost your tap damage.\n\nUtility Buildings provide special bonuses like cost reduction or increased rewards.',
  },
  {
    title: 'Combat',
    content: 'Tap enemies to deal damage! Defeat them before the timer runs out to advance to the next wave.\n\nEvery 10 waves, a boss appears with extra health but better rewards.\n\nFailing a wave restarts it - no penalty, just try again!',
  },
  {
    title: 'Building Evolution',
    content: 'Buildings evolve into more powerful versions as you reach higher waves. Watch for the "Evolves at Wave X" indicator on each building.',
  },
  {
    title: 'Prestige',
    content: 'Once you reach Wave 10, you can Prestige to reset your progress but earn Blueprints.\n\nBlueprints buy permanent upgrades that make future runs easier.\n\nThe further you progress before prestiging, the more blueprints you earn!',
  },
  {
    title: 'Tips for Success',
    content: '1. Balance builders between production and combat.\n\n2. Upgrade buildings to increase their efficiency.\n\n3. Don\'t forget to tap during boss waves!\n\n4. Prestige early and often for faster progression.\n\n5. Lucky drops can give you big boosts - watch for them after wave clears!',
  },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  visible,
  onClose,
  buildings,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('help');

  // Get unlocked story entries based on buildings and their evolution tiers
  const getUnlockedStoryEntries = (): StoryEntry[] => {
    const unlocked: StoryEntry[] = [];

    for (const building of buildings) {
      if (!building.isUnlocked) continue;

      const evolvable = EVOLVABLE_BUILDINGS.find(b => b.id === building.typeId);
      if (!evolvable) continue;

      // Get all story entries for this building up to current tier
      const buildingStories = STORY_ENTRIES.filter(
        entry => entry.buildingId === building.typeId && entry.tier <= building.evolutionTier,
      );

      unlocked.push(...buildingStories);
    }

    // Sort by unlock order (roughly by wave)
    return unlocked.sort((a, b) => {
      const buildingA = EVOLVABLE_BUILDINGS.find(e => e.id === a.buildingId);
      const buildingB = EVOLVABLE_BUILDINGS.find(e => e.id === b.buildingId);
      const tierA = buildingA?.tiers.find(t => t.tier === a.tier);
      const tierB = buildingB?.tiers.find(t => t.tier === b.tier);
      return (tierA?.unlockWave ?? 0) - (tierB?.unlockWave ?? 0);
    });
  };

  const unlockedStories = getUnlockedStoryEntries();

  return (
    <Modal visible={visible} animationType="slide">
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>×</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'help' && styles.activeTab]}
            onPress={() => setActiveTab('help')}>
            <Text style={[styles.tabText, activeTab === 'help' && styles.activeTabText]}>
              How to Play
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'story' && styles.activeTab]}
            onPress={() => setActiveTab('story')}>
            <Text style={[styles.tabText, activeTab === 'story' && styles.activeTabText]}>
              Story
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {activeTab === 'help' && (
            <View style={styles.helpContainer}>
              {HELP_SECTIONS.map((section, index) => (
                <View key={index} style={styles.helpSection}>
                  <Text style={styles.sectionTitle}>{section.title}</Text>
                  <Text style={styles.sectionContent}>{section.content}</Text>
                </View>
              ))}
            </View>
          )}

          {activeTab === 'story' && (
            <View style={styles.storyContainer}>
              {unlockedStories.length === 0 ? (
                <View style={styles.emptyStory}>
                  <Text style={styles.emptyStoryText}>
                    Your story begins when you start building...
                  </Text>
                </View>
              ) : (
                unlockedStories.map(entry => {
                  const building = EVOLVABLE_BUILDINGS.find(b => b.id === entry.buildingId);
                  const tier = building?.tiers.find(t => t.tier === entry.tier);

                  return (
                    <View
                      key={`${entry.buildingId}-${entry.tier}`}
                      style={[styles.storyEntry, {borderLeftColor: tier?.color ?? '#888'}]}>
                      <View style={styles.storyHeader}>
                        <Text style={[styles.storyTitle, {color: tier?.color ?? '#fff'}]}>
                          {entry.title}
                        </Text>
                        <Text style={styles.storyBuilding}>
                          {tier?.name}
                        </Text>
                      </View>
                      <Text style={styles.storyText}>{entry.story}</Text>
                    </View>
                  );
                })
              )}

              {unlockedStories.length > 0 && unlockedStories.length < STORY_ENTRIES.length && (
                <View style={styles.moreStory}>
                  <Text style={styles.moreStoryText}>
                    Continue playing to unlock more of the story...
                  </Text>
                  <Text style={styles.moreStoryHint}>
                    {STORY_ENTRIES.length - unlockedStories.length} chapters remaining
                  </Text>
                </View>
              )}

              {unlockedStories.length === STORY_ENTRIES.length && (
                <View style={styles.storyComplete}>
                  <Text style={styles.storyCompleteText}>
                    You have unlocked the complete story!
                  </Text>
                  <Text style={styles.storyCompleteSubtext}>
                    Humanity's triumph over the machines is complete.
                  </Text>
                </View>
              )}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
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
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
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
    borderBottomColor: '#4CAF50',
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
  helpContainer: {
    padding: 16,
  },
  helpSection: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  sectionContent: {
    color: '#ccc',
    fontSize: 14,
    lineHeight: 22,
  },
  storyContainer: {
    padding: 16,
  },
  emptyStory: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStoryText: {
    color: '#666',
    fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  storyEntry: {
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
  },
  storyHeader: {
    marginBottom: 12,
  },
  storyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  storyBuilding: {
    color: '#888',
    fontSize: 12,
    fontStyle: 'italic',
  },
  storyText: {
    color: '#ccc',
    fontSize: 14,
    lineHeight: 22,
  },
  moreStory: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#333',
  },
  moreStoryText: {
    color: '#888',
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  moreStoryHint: {
    color: '#4CAF50',
    fontSize: 12,
    marginTop: 8,
  },
  storyComplete: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#1a2a1a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  storyCompleteText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  storyCompleteSubtext: {
    color: '#888',
    fontSize: 13,
    marginTop: 8,
    textAlign: 'center',
  },
});
